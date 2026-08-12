import iconv from 'iconv-lite';
export function decodeBuffer(buffer, encoding) {
    if (encoding) {
        return iconv.decode(buffer, encoding);
    }
    // BOM Detection
    if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
        return iconv.decode(buffer.subarray(3), 'utf-8');
    }
    if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
        return iconv.decode(buffer.subarray(2), 'utf-16le');
    }
    if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
        return iconv.decode(buffer.subarray(2), 'utf-16be');
    }
    // Default to UTF-8
    return iconv.decode(buffer, 'utf-8');
}
