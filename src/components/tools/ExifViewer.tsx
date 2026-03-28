import { useState } from 'react';
import FileUploader from '../shared/FileUploader';

interface ExifData {
  [key: string]: string | number | undefined;
}

function readExif(buffer: ArrayBuffer): ExifData {
  const view = new DataView(buffer);
  const data: ExifData = {};

  // Check for JPEG SOI marker
  if (view.getUint16(0) !== 0xFFD8) {
    return { Error: 'Not a JPEG file' };
  }

  let offset = 2;
  while (offset < view.byteLength - 2) {
    const marker = view.getUint16(offset);
    if (marker === 0xFFE1) { // APP1 (EXIF)
      const length = view.getUint16(offset + 2);
      // Check for "Exif\0\0" header
      const exifHeader = String.fromCharCode(
        view.getUint8(offset + 4), view.getUint8(offset + 5),
        view.getUint8(offset + 6), view.getUint8(offset + 7)
      );
      if (exifHeader === 'Exif') {
        const tiffStart = offset + 10;
        const byteOrder = view.getUint16(tiffStart);
        const littleEndian = byteOrder === 0x4949;
        const ifdOffset = view.getUint32(tiffStart + 4, littleEndian);
        const ifdStart = tiffStart + ifdOffset;
        const entries = view.getUint16(ifdStart, littleEndian);

        const tagNames: Record<number, string> = {
          0x010F: 'Make', 0x0110: 'Model', 0x0112: 'Orientation',
          0x011A: 'XResolution', 0x011B: 'YResolution', 0x0128: 'ResolutionUnit',
          0x0131: 'Software', 0x0132: 'DateTime', 0x0213: 'YCbCrPositioning',
          0x8769: 'ExifIFD', 0x8825: 'GPSIFD',
          0xA002: 'PixelXDimension', 0xA003: 'PixelYDimension',
          0x829A: 'ExposureTime', 0x829D: 'FNumber',
          0x8827: 'ISOSpeedRatings', 0x9003: 'DateTimeOriginal',
          0x920A: 'FocalLength',
        };

        for (let i = 0; i < entries && ifdStart + 2 + i * 12 + 12 <= view.byteLength; i++) {
          const entryOffset = ifdStart + 2 + i * 12;
          const tag = view.getUint16(entryOffset, littleEndian);
          const type = view.getUint16(entryOffset + 2, littleEndian);
          const count = view.getUint32(entryOffset + 4, littleEndian);

          const name = tagNames[tag] || `Tag 0x${tag.toString(16).toUpperCase()}`;

          if (type === 3 && count === 1) { // SHORT
            data[name] = view.getUint16(entryOffset + 8, littleEndian);
          } else if (type === 4 && count === 1) { // LONG
            data[name] = view.getUint32(entryOffset + 8, littleEndian);
          } else if (type === 2) { // ASCII
            const valueOffset = count > 4 ? view.getUint32(entryOffset + 8, littleEndian) + tiffStart : entryOffset + 8;
            let str = '';
            for (let j = 0; j < count - 1 && valueOffset + j < view.byteLength; j++) {
              str += String.fromCharCode(view.getUint8(valueOffset + j));
            }
            data[name] = str;
          }
        }
      }
      break;
    } else if ((marker & 0xFF00) === 0xFF00) {
      offset += 2 + view.getUint16(offset + 2);
    } else {
      break;
    }
  }

  if (Object.keys(data).length === 0) {
    return { Info: 'No EXIF data found in this image' };
  }
  return data;
}

export default function ExifViewer() {
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);

  const handleFile = (file: File, buffer: ArrayBuffer) => {
    setFileName(file.name);
    setFileSize(file.size);
    setPreview(URL.createObjectURL(file));
    setExifData(readExif(buffer));
  };

  return (
    <div className="space-y-4">
      <FileUploader accept="image/jpeg,image/tiff" maxSize={50 * 1024 * 1024} onFile={handleFile} label="Drop a JPEG image to view its EXIF metadata" />

      {exifData && (
        <div className="grid gap-4 lg:grid-cols-2">
          {preview && (
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-2">
              <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded" />
              <p className="mt-2 text-center text-xs text-surface-500">{fileName} ({(fileSize / 1024).toFixed(0)} KB)</p>
            </div>
          )}
          <div className="rounded-lg border border-surface-200">
            <table className="w-full text-sm">
              <thead className="bg-surface-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-surface-500">Property</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-surface-500">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {Object.entries(exifData).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-3 py-2 text-surface-600">{key}</td>
                    <td className="px-3 py-2 font-mono text-xs">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
