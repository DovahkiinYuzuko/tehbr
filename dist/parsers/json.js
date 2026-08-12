export async function parseJSON(content) {
    const parsed = JSON.parse(content);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    const headerSet = [];
    for (const item of items) {
        if (typeof item === 'object' && item !== null) {
            for (const key of Object.keys(item)) {
                if (!headerSet.includes(key)) {
                    headerSet.push(key);
                }
            }
        }
    }
    const rows = items.map((item) => {
        if (typeof item !== 'object' || item === null) {
            return headerSet.map(() => '');
        }
        return headerSet.map((header) => {
            if (Object.prototype.hasOwnProperty.call(item, header)) {
                const val = item[header];
                if (val === null || val === undefined) {
                    return '';
                }
                return String(val);
            }
            return '';
        });
    });
    return {
        headers: headerSet,
        rows,
    };
}
