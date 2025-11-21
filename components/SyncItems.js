import dbTools from '../components/DbTools';

export default async function syncItems(db, user) {
    const owner_id = user.id;
    const tools = dbTools(db, user);
    const {
        getLocalItems,
        getBackendItems,
        insertLocalItem,
        insertLocalItemBackend,
        replaceLocalItem,
        replaceLocalItemBackend,
        deleteLocalItem,
        postBackendItem,
        putBackendItem,
        deleteBackendItem,
    } = tools;

    const result = {
        ok: true,
        stage: 'init',
        errors: [],
        stats: { posted: 0, put: 0, deleted: 0, insertedLocal: 0, updatedLocal: 0 },
    };

    const parseDate = (ts) => {
        const n = Date.parse(ts);
        return Number.isNaN(n) ? null : n;
    };

    const isLocalNewerOrSame = (localTs, backendTs) => {
        const l = parseDate(localTs);
        const b = parseDate(backendTs);
        if (b === null) return true;   // missing/invalid backend timestamp => treat local as newer
        if (l === null) return false;  // missing local timestamp => treat backend as newer
        return l >= b;
    };

    let backendItems = [];
    let localItems = [];

    // Fetch backend items
    try {
        const { data, error } = await getBackendItems();
        if (error || !data) {
            return {
                ...result,
                ok: false,
                stage: 'preflight',
                errors: [`Backend items fetch failed: ${error?.message ?? 'no data returned'}`],
            };
        }
        backendItems = data;
    } catch (err) {
        return { ...result, ok: false, stage: 'preflight', errors: [`Backend fetch crashed: ${err.message}`] };
    }

    // Fetch local items
    try {
        const { data, error } = await getLocalItems();
        if (error || !data) {
            return {
                ...result,
                ok: false,
                stage: 'preflight',
                errors: [`Local items fetch failed: ${error?.message ?? 'no data returned'}`],
            };
        }
        localItems = data;
    } catch (err) {
        return { ...result, ok: false, stage: 'preflight', errors: [`Local fetch crashed: ${err.message}`] };
    }

    // If no local data, import everything from backend
    if (!localItems || localItems.length === 0) {
        for (const b of backendItems) {
            try {
                const ins = await insertLocalItemBackend(b);
                if (ins?.error) throw ins.error;
                result.stats.insertedLocal += 1;
            } catch (err) {
                result.ok = false;
                result.errors.push(`Insert local failed for backend id ${b.id}: ${err.message}`);
            }
        }
        result.stage = 'imported-backend';
        return result;
    }

    // FRONT -> BACK
    for (const f of localItems) {
        try {
            if (!f.backend_id) {
                // new local item
                if (f.deleted === 1) {
                    const dres = await deleteLocalItem(f.id);
                    if (dres?.error) throw dres.error;
                    result.stats.deleted += 1;
                } else {
                    const pres = await postBackendItem(f);
                    if (pres.error || !pres.data) throw pres.error ?? new Error('no data returned from POST');
                    const backendId = pres.data.id;
                    const backendTs = pres.data.timestamp ?? f.timestamp;
                    const updateItem = {
                        ...f,
                        backend_id: backendId,
                        timestamp: backendTs,
                        owner: owner_id,
                        description: f.description ?? f.desc ?? "",
                        image: f.image ?? f.uri ?? "",
                    };
                    const ures = await replaceLocalItem(updateItem);
                    if (ures?.error) throw ures.error;
                    // keep in-memory copy up to date to avoid duplicate inserts later
                    f.backend_id = backendId;
                    f.timestamp = backendTs;
                    f.image = updateItem.image;
                    f.description = updateItem.description;
                    result.stats.posted += 1;
                }
                continue;
            }

            // existing item with backend link
            const b = backendItems.find((x) => x.id === f.backend_id);

            if (!b) {
                // backend missing -> recreate
                const pres = await postBackendItem(f);
                if (pres.error || !pres.data) throw pres.error ?? new Error('no data returned from POST');
                const backendId = pres.data.id;
                const backendTs = pres.data.timestamp ?? f.timestamp;
                const updateItem = {
                    ...f,
                    backend_id: backendId,
                    timestamp: backendTs,
                    owner: owner_id,
                    description: f.description ?? f.desc ?? "",
                    image: f.image ?? f.uri ?? "",
                };
                const ures = await replaceLocalItem(updateItem);
                if (ures?.error) throw ures.error;
                f.backend_id = backendId;
                f.timestamp = backendTs;
                f.image = updateItem.image;
                f.description = updateItem.description;
                result.stats.posted += 1;
                continue;
            }

            if (isLocalNewerOrSame(f.timestamp, b.timestamp)) {
                if (f.deleted === 1) {
                    const bres = await deleteBackendItem(f.backend_id);
                    if (bres?.error) throw bres.error;
                    const dres = await deleteLocalItem(f.id);
                    if (dres?.error) throw dres.error;
                    result.stats.deleted += 1;
                } else {
                    const ures = await putBackendItem(f);
                    if (ures?.error || !ures?.data) throw ures?.error ?? new Error('no data returned from PUT');
                    const backendTs = ures.data.timestamp ?? f.timestamp;
                    const updateItem = {
                        ...f,
                        timestamp: backendTs,
                        owner: owner_id,
                        description: f.description ?? f.desc ?? "",
                        image: f.image ?? f.uri ?? "",
                    };
                    const lres = await replaceLocalItem(updateItem);
                    if (lres?.error) throw lres.error;
                    f.timestamp = backendTs;
                    f.image = updateItem.image;
                    f.description = updateItem.description;
                    result.stats.put += 1;
                }
            } else {
                // backend newer -> update local from backend
                const updateItem = {
                    id: f.id,
                    backend_id: b.id,
                    name: b.name,
                    location: b.location ?? "",
                    description: b.desc ?? b.description ?? "",
                    owner: owner_id,
                    category_id: b.category_id ?? 0,
                    group_id: Number(b.group_id) || 0,
                    image: f.image ?? f.uri ?? "",
                    backend_image: b.image ?? b.uri ?? "",
                    size: b.size ?? "",
                    timestamp: b.timestamp ?? f.timestamp,
                    on_market_place: b.on_market_place ?? 0,
                    price: b.price ?? 0,
                    deleted: b.deleted ?? 0,
                };
                const lres = await replaceLocalItemBackend(updateItem);
                if (lres?.error) throw lres.error;
                f.backend_id = b.id;
                f.timestamp = updateItem.timestamp;
                f.name = updateItem.name;
                f.location = updateItem.location;
                f.description = updateItem.description;
                f.category_id = updateItem.category_id;
                f.group_id = updateItem.group_id;
                f.backend_image = updateItem.image;
                f.size = updateItem.size;
                f.on_market_place = updateItem.on_market_place;
                f.price = updateItem.price;
                f.deleted = updateItem.deleted;
                result.stats.updatedLocal += 1;
            }
        } catch (err) {
            result.ok = false;
            result.errors.push(`front->back item ${f.id ?? 'new'} failed: ${err.message}`);
        }
    }

    // BACK -> FRONT
    for (const b of backendItems) {
        try {
            const local = localItems.find((x) => x.backend_id === b.id);
            if (!local) {
                const ins = await insertLocalItemBackend(b);
                if (ins?.error) throw ins.error;
                result.stats.insertedLocal += 1;
                continue;
            }

            if (!isLocalNewerOrSame(local.timestamp, b.timestamp)) {
                const updateItem = {
                    id: local.id,
                    backend_id: b.id,
                    name: b.name,
                    location: b.location ?? "",
                    description: b.desc ?? b.description ?? "",
                    owner: owner_id,
                    category_id: b.category_id ?? 0,
                    group_id: Number(b.group_id) || 0,
                    image: local.image ?? local.uri ?? "",
                    backend_image: b.image ?? b.uri ?? "",
                    size: b.size ?? "",
                    timestamp: b.timestamp ?? local.timestamp,
                    on_market_place: b.on_market_place ?? 0,
                    price: b.price ?? 0,
                    deleted: b.deleted ?? 0,
                };
                const lres = await replaceLocalItemBackend(updateItem);
                if (lres?.error) throw lres.error;
                result.stats.updatedLocal += 1;
            }
        } catch (err) {
            result.ok = false;
            result.errors.push(`back->front backend id ${b.id} failed: ${err.message}`);
        }
    }

    result.stage = 'done';
    return result;
}
