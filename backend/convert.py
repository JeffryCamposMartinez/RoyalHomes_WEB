from PIL import Image
import imageio

input_path = r"C:\Users\Jeffry\.gemini\antigravity-ide\brain\ccc0abfe-8c7d-4953-8b0e-69a158f71066\complete_store_tour_1784314573989.webp"
output_path = r"C:\Users\Jeffry\Desktop\Demostracion_Tienda.mp4"

print("Cargando WEBP animado...")
img = Image.open(input_path)

frames = []
for frame_idx in range(img.n_frames):
    img.seek(frame_idx)
    frames.append(img.convert("RGB"))

import numpy as np

print(f"Escribiendo {len(frames)} fotogramas a MP4...")
with imageio.get_writer(output_path, fps=25) as writer:
    for frame in frames:
        writer.append_data(np.array(frame))

print("¡Conversión completada con éxito!")
