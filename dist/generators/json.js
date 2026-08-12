export function generateJSON(ir) {
    const objects = ir.rows.map((row) => {
        const obj = {};
        ir.headers.forEach((header, index) => {
            obj[header] = row[index] !== undefined ? row[index] : '';
        });
        return obj;
    });
    return JSON.stringify(objects, null, 2);
}
