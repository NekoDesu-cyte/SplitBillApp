import sys
import easyocr
import json
import re

def clean_price(price_str):
    return int(re.sub(r'\D', '', price_str))

def parse_receipt(image_path):
    try:
        reader = easyocr.Reader(['id', 'en'], gpu=False, verbose=False)
        results = reader.readtext(image_path)

        items = []
        raw_texts = []

        stop_words_regex = r'^(sub\s*tot|tota|bayar|cash|kembali|tunai|change|pajak|tax|ppn|diskon|discount|payment|debit|kredit|bca|mandiri|bri|bni|qris|ovo|gopay|dana|linkaja|shopeepay|admin|service)'
        ignore_words = ['jl', 'jl.', 'telp', 'tanggal', 'waktu', 'kasir', 'struk', 'pos1', 'check no', 'www.']

        max_y = 0
        for bbox, text, prob in results:
            center_y = (bbox[0][1] + bbox[2][1]) / 2
            if center_y > max_y:
                max_y = center_y

        cutoff_y = float('inf')
        for bbox, text, prob in results:
            t_lower = text.strip().lower()
            if re.search(stop_words_regex, t_lower):
                center_y = (bbox[0][1] + bbox[2][1]) / 2
                if center_y > max_y * 0.3 and center_y < cutoff_y:
                    cutoff_y = center_y - 15  

        for bbox, text, prob in results:
            center_y = (bbox[0][1] + bbox[2][1]) / 2
            if center_y > cutoff_y:
                continue
                
            t = text.strip()
            t_lower = t.lower()
            
            if t and not any(w in t_lower for w in ignore_words):
                raw_texts.append(t)

        current_name = None
        
        for i, text in enumerate(raw_texts):
            text_lower = text.lower()
            
            prices = re.findall(r'(?:rp\s*)?(\d{1,3}(?:[.,]\d{3})+)', text_lower)
            
            if prices:
                total_price_str = prices[-1]
                price_val = clean_price(total_price_str)
                
                if price_val < 500: 
                    continue

                # --- RADAR QTY YANG ANTI-KEBLINGER ---
                qty = 1
                for k in range(i, max(-1, i-3), -1):
                    check_text = raw_texts[k].lower()
                    
                    # 1. Format "1 x 12.000" -> Ambil angka SATU-nya saja!
                    m_full = re.search(r'\b(\d{1,2})\s*[xX\*]\s*\d{3,}', check_text)
                    
                    # 2. Format "x2" -> Pastikan setelahnya BUKAN titik/koma (biar gak nangkep x 12.000)
                    m_end = re.search(r'[xX\*]\s*(\d{1,2})\b(?!\s*[,.]\d)', check_text)
                    
                    # 3. Format "2x" atau "2 x"
                    m_start = re.search(r'\b(\d{1,2})\s*[xX\*]', check_text)
                    
                    # 4. Format "1 lusin x"
                    m_lusin = re.search(r'\b(\d{1,2})\s+[a-z]+\s+[xX\*]', check_text)
                    
                    # 5. Format awalan "2 Nasi Goreng"
                    m_front = re.search(r'^(\d{1,2})\s+[a-z]', check_text)

                    if m_full:
                        qty = int(m_full.group(1))
                        break
                    elif m_lusin:
                        qty = int(m_lusin.group(1))
                        break
                    elif m_start:
                        qty = int(m_start.group(1))
                        break
                    elif m_end:
                        qty = int(m_end.group(1))
                        break
                    elif m_front and k == i:
                        qty = int(m_front.group(1))
                        break

                if qty == 0: qty = 1
                
                # BAGI HARGA TOTAL DENGAN QTY 
                unit_price = price_val // qty

                name_candidate = text
                for p in prices: 
                    name_candidate = re.sub(r'(?:rp\s*)?' + re.escape(p), '', name_candidate, flags=re.IGNORECASE)
                
                # Bersihkan semua sisa teks QTY dari nama menu
                name_candidate = re.sub(r'\b\d{1,2}\s*[xX\*]\s*\d{3,}', '', name_candidate, flags=re.IGNORECASE)
                name_candidate = re.sub(r'[xX\*]\s*\d{1,2}\b(?!\s*[,.]\d)', '', name_candidate, flags=re.IGNORECASE)
                name_candidate = re.sub(r'\b\d{1,2}\s*[xX\*]', '', name_candidate, flags=re.IGNORECASE)
                name_candidate = re.sub(r'\b\d{1,2}\s+[a-z]+\s+[xX\*]', '', name_candidate, flags=re.IGNORECASE)
                name_candidate = re.sub(r'^(\d{1,2})\s+', '', name_candidate).strip()
                name_candidate = re.sub(r'[^a-zA-Z0-9]+$', '', name_candidate).strip()

                if len(re.sub(r'[^a-zA-Z]', '', name_candidate)) > 2:
                    items.append({"name": name_candidate.title(), "price": unit_price, "quantity": qty})
                    current_name = None 
                else:
                    if current_name:
                        items.append({"name": current_name.title(), "price": unit_price, "quantity": qty})
                        current_name = None
                    else:
                        for j in range(i-1, max(-1, i-5), -1):
                            prev_text = raw_texts[j]
                            clean_prev = re.sub(r'^\d+[\.\s]*', '', prev_text).strip()
                            clean_prev = re.sub(r'\b\d{1,2}\s*[xX\*]\s*\d{3,}', '', clean_prev, flags=re.IGNORECASE)
                            clean_prev = re.sub(r'[xX\*]\s*\d{1,2}\b(?!\s*[,.]\d)', '', clean_prev, flags=re.IGNORECASE)
                            clean_prev = re.sub(r'\b\d{1,2}\s*[xX\*]', '', clean_prev, flags=re.IGNORECASE)
                            clean_prev = re.sub(r'[^a-zA-Z0-9]+$', '', clean_prev).strip()
                            
                            if re.search(r'[a-zA-Z]{3,}', clean_prev):
                                items.append({"name": clean_prev.title(), "price": unit_price, "quantity": qty})
                                break
            else:
                clean_text = re.sub(r'^\d+[\.\s]*', '', text).strip()
                if re.search(r'[a-zA-Z]{3,}', clean_text):
                    current_name = clean_text

        hard_filter_words = ['sub', 'tot', 'bayar', 'cash', 'kembali', 'change', 'pajak', 'tax', 'diskon', 'meja', 'kode']
        
        unique_items = []
        seen = set()
        
        for item in items:
            name_lower = item['name'].lower()
            is_forbidden = any(hw in name_lower for hw in hard_filter_words)
            
            if item['price'] > 0 and len(item['name']) > 2 and not is_forbidden:
                identifier = f"{item['name'].lower()}-{item['price']}"
                if identifier not in seen:
                    seen.add(identifier)
                    unique_items.append(item)

        print(json.dumps(unique_items))
        
    except Exception as e:
        print(json.dumps([]))

if __name__ == "__main__":
    parse_receipt(sys.argv[1])