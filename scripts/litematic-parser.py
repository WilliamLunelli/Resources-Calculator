import nbtlib
import sys
import json
from collections import Counter
import math

def decode_block_states(block_states_data, palette_size, volume):
    """Decodifica os BlockStates compactados"""
    # Calcular bits por bloco
    bits_per_block = max(4, math.ceil(math.log2(palette_size))) if palette_size > 1 else 4
    
    # Converter LongArray para lista de inteiros
    longs = [int(long_val) for long_val in block_states_data]
    
    # Decodificar os bits
    block_indices = []
    bits_processed = 0
    current_long = 0
    current_bit_pos = 0
    
    for i in range(volume):
        if bits_processed == 0 or current_bit_pos + bits_per_block > 64:
            if current_long < len(longs):
                current_long_value = longs[current_long] & ((1 << 64) - 1)
                current_long += 1
                current_bit_pos = 0
            else:
                break
        
        # Extrair bits do bloco atual
        mask = (1 << bits_per_block) - 1
        if current_bit_pos + bits_per_block <= 64:
            block_id = (current_long_value >> current_bit_pos) & mask
            current_bit_pos += bits_per_block
        else:
            # Bloco se estende por dois longs
            bits_in_current = 64 - current_bit_pos
            bits_in_next = bits_per_block - bits_in_current
            
            block_id = (current_long_value >> current_bit_pos) & ((1 << bits_in_current) - 1)
            
            if current_long < len(longs):
                current_long_value = longs[current_long] & ((1 << 64) - 1)
                current_long += 1
                block_id |= (current_long_value & ((1 << bits_in_next) - 1)) << bits_in_current
                current_bit_pos = bits_in_next
            else:
                break
        
        if block_id < palette_size:
            block_indices.append(block_id)
        
        bits_processed += bits_per_block
    
    return block_indices

def analyze_litematic_to_json(file_path):
    """Analisa litematic e exporta para JSON"""
    try:
        nbt_file = nbtlib.load(file_path)
        
        result = {
            "metadata": {},
            "regions": {}
        }
        
        # Extrair metadata
        if 'Metadata' in nbt_file:
            metadata = nbt_file['Metadata']
            result["metadata"] = {
                "name": str(metadata.get('Name', 'Unnamed')),
                "author": str(metadata.get('Author', 'Unknown')),
                "total_blocks": int(metadata.get('TotalBlocks', 0)),
                "total_volume": int(metadata.get('TotalVolume', 0)),
                "region_count": int(metadata.get('RegionCount', 0)),
                "description": str(metadata.get('Description', '')),
                "enclosing_size": {
                    "x": int(metadata.get('EnclosingSize', {}).get('x', 0)),
                    "y": int(metadata.get('EnclosingSize', {}).get('y', 0)),
                    "z": int(metadata.get('EnclosingSize', {}).get('z', 0))
                } if 'EnclosingSize' in metadata else {}
            }
        
        # Processar regiões
        if 'Regions' in nbt_file:
            for region_name, region_data in nbt_file['Regions'].items():
                region_result = {
                    "size": {},
                    "position": {},
                    "block_counts": {},
                    "total_blocks": 0
                }
                
                # Tamanho da região
                if 'Size' in region_data:
                    size = region_data['Size']
                    region_result["size"] = {
                        "x": int(size.get('x', 0)),
                        "y": abs(int(size.get('y', 0))),  # Pegar valor absoluto
                        "z": int(size.get('z', 0))
                    }
                
                # Posição da região
                if 'Position' in region_data:
                    pos = region_data['Position']
                    region_result["position"] = {
                        "x": int(pos.get('x', 0)),
                        "y": int(pos.get('y', 0)),
                        "z": int(pos.get('z', 0))
                    }
                
                # Processar blocos se tiver paleta
                if 'BlockStatePalette' in region_data and 'BlockStates' in region_data:
                    palette = region_data['BlockStatePalette']
                    block_states = region_data['BlockStates']
                    
                    # Calcular volume
                    volume = region_result["size"]["x"] * region_result["size"]["y"] * region_result["size"]["z"]
                    
                    print(f"Processando região {region_name}: {len(palette)} tipos, volume {volume}")
                    
                    try:
                        # Decodificar block states
                        block_indices = decode_block_states(block_states, len(palette), volume)
                        
                        # Contar blocos
                        block_counter = Counter(block_indices)
                        
                        # Converter para formato final
                        for palette_idx, count in block_counter.items():
                            if palette_idx < len(palette):
                                block_info = palette[palette_idx]
                                block_name = str(block_info['Name']).replace('minecraft:', '')
                                
                                # Incluir propriedades se existirem
                                properties = {}
                                if 'Properties' in block_info and block_info['Properties']:
                                    properties = {k: str(v) for k, v in block_info['Properties'].items()}
                                
                                # Criar chave única para o bloco (nome + propriedades)
                                if properties:
                                    block_key = f"{block_name}[{','.join([f'{k}={v}' for k, v in sorted(properties.items())])}]"
                                else:
                                    block_key = block_name
                                
                                region_result["block_counts"][block_key] = {
                                    "name": block_name,
                                    "properties": properties,
                                    "count": count,
                                    "stacks": count // 64,
                                    "remainder": count % 64
                                }
                                
                                region_result["total_blocks"] += count
                    
                    except Exception as e:
                        print(f"Erro ao decodificar blocks: {e}")
                        # Fallback: só mostrar paleta
                        for i, block_info in enumerate(palette):
                            block_name = str(block_info['Name']).replace('minecraft:', '')
                            properties = {}
                            if 'Properties' in block_info:
                                properties = {k: str(v) for k, v in block_info['Properties'].items()}
                            
                            block_key = f"{block_name}[{','.join([f'{k}={v}' for k, v in sorted(properties.items())])}]" if properties else block_name
                            
                            region_result["block_counts"][block_key] = {
                                "name": block_name,
                                "properties": properties,
                                "count": 0,  # Não conseguimos contar
                                "stacks": 0,
                                "remainder": 0,
                                "note": "Count unavailable - palette only"
                            }
                
                result["regions"][region_name] = region_result
        
        # Salvar JSON
        output_file = file_path.replace('.litematic', '_blocks.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\nJSON salvo em: {output_file}")
        
        # Mostrar resumo no terminal
        print("\n=== RESUMO ===")
        for region_name, region in result["regions"].items():
            print(f"\nRegião {region_name}:")
            print(f"  Total de blocos: {region['total_blocks']}")
            print(f"  Tipos diferentes: {len(region['block_counts'])}")
            
            # Top 10 blocos
            sorted_blocks = sorted(region['block_counts'].items(), 
                                 key=lambda x: x[1]['count'], reverse=True)
            
            print("  Top 10 blocos:")
            for i, (block_key, data) in enumerate(sorted_blocks[:10]):
                count = data['count']
                if count > 0:
                    if data['stacks'] > 0:
                        print(f"    {data['name']}: {count} ({data['stacks']} stacks + {data['remainder']})")
                    else:
                        print(f"    {data['name']}: {count}")
                else:
                    print(f"    {data['name']}: [paleta apenas]")
        
        return result
        
    except Exception as e:
        print(f"Erro: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python lith.py arquivo.litematic")
    else:
        analyze_litematic_to_json(sys.argv[1])