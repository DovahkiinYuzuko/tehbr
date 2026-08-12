export function generateSQL(ir, options) {
    const tableName = options?.tableName || 'table_name';
    const escapeIdentifier = (id) => `"${id.replace(/"/g, '""')}"`;
    const escapeValue = (val) => `'${val.replace(/'/g, "''")}'`;
    const quotedTableName = escapeIdentifier(tableName);
    const quotedHeaders = ir.headers.map(escapeIdentifier);
    const columnDefs = quotedHeaders.map((col) => `  ${col} TEXT`).join(',\n');
    const createTableStmt = `CREATE TABLE ${quotedTableName} (\n${columnDefs}\n);`;
    if (ir.rows.length === 0) {
        return createTableStmt;
    }
    const columnsList = quotedHeaders.join(', ');
    const valuesLines = ir.rows.map((row) => {
        const rowValues = ir.headers.map((_, i) => escapeValue(row[i] !== undefined ? row[i] : ''));
        return `  (${rowValues.join(', ')})`;
    });
    const insertStmt = `INSERT INTO ${quotedTableName} (${columnsList}) VALUES\n${valuesLines.join(',\n')};`;
    return `${createTableStmt}\n\n${insertStmt}`;
}
