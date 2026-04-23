// =============================================
// app/emiten/[code]/page.tsx
// VERSI SUPER SIMPLE - Sesuai nama folder [code]
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EmitenDetail({ 
  params 
}: { 
  params: { code: string }  // ⬅️ PERUBAHAN: kode → code
}) {
  const stockCode = params.code.toUpperCase();  // ⬅️ PERUBAHAN: kode → code
  
  console.log('Mencari saham:', stockCode);
  
  // Query super simple - hanya ambil 1 data terbaru
  const { data, error } = await supabase
    .from('daily_transactions')
    .select('*')
    .eq('stock_code', stockCode)
    .order('trading_date', { ascending: false })
    .limit(1);

  console.log('Query result:', { data, error });

  // Tampilkan error kalau ada
  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>❌ Database Error</h1>
        <pre style={{ 
          background: '#fee', 
          padding: '15px', 
          borderRadius: '8px',
          overflow: 'auto' 
        }}>
          {JSON.stringify(error, null, 2)}
        </pre>
        <Link href="/" style={{ color: 'blue' }}>← Kembali</Link>
      </div>
    );
  }

  // Tampilkan data mentah
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>📊 Detail Saham: {stockCode}</h1>
      
      <div style={{ 
        background: '#f0f9ff', 
        padding: '15px', 
        borderRadius: '8px',
        margin: '20px 0' 
      }}>
        <h2>🐛 Debug Info</h2>
        <p><strong>Data ditemukan:</strong> {data?.length || 0} baris</p>
        <p><strong>Error:</strong> {error ? 'Ada error' : 'Tidak ada error'}</p>
      </div>

      {data && data.length > 0 ? (
        <div>
          <h2>✅ Data Ditemukan</h2>
          <div style={{ 
            background: '#f9f9f9', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {Object.entries(data[0]).map(([key, value]) => (
                  <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ 
                      padding: '8px', 
                      fontWeight: 'bold',
                      width: '200px',
                      background: '#f5f5f5'
                    }}>
                      {key}
                    </td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>
                      {value === null ? 'null' : String(value)}
                    </td>
                    <td style={{ padding: '8px', color: '#666' }}>
                      {typeof value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ 
          background: '#fff3cd', 
          padding: '20px', 
          borderRadius: '8px' 
        }}>
          <h2>⚠️ Data Tidak Ditemukan</h2>
          <p>Saham dengan kode <strong>{stockCode}</strong> tidak ada dalam database.</p>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <Link 
          href="/" 
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px'
          }}
        >
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
