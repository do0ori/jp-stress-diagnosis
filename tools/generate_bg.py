
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import numpy as np
import math
import os

# Create assets directory if not exists
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'assets')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Coefficients (Hardcoded from diagnosis_service.py)
A, B, alpha, beta = 8.2500, 7.4688, 0.07668, -0.08896
C, D, gamma, delta = 7.3000, 8.2668, -0.09711, -0.09711

def generate_graph_image(filename, title, x_label, y_label, coefs, x_range, y_range):
    A_val, B_val, a_val, b_val = coefs
    
    # Increase DPI for better resolution on web
    fig, ax = plt.subplots(figsize=(6, 6), dpi=150)
    
    # Grid
    x = np.linspace(x_range[0], x_range[1], 200)
    y = np.linspace(y_range[0], y_range[1], 200)
    X, Y = np.meshgrid(x, y)
    
    # Risk Calculation
    Z = 100 * np.exp((X - A_val) * a_val + (Y - B_val) * b_val)
    
    # Define Colors and Levels for Fill
    # ~100: No Color (White/Transparent)
    # 100~120: Light Yellow (#FFFFCC)
    # 120~140: Yellow (#FFFF00)
    # 140~160: Light Orange (#FFCC99)
    # 160~180: Orange (#FF9900)
    # 180~: Red (#FF0000)
    fill_levels = [100, 120, 140, 160, 180, 500]
    fill_colors = ['#FFFFCC', '#FFFF00', '#FFCC99', '#FF9900', '#FF0000']
    cmap = mcolors.ListedColormap(fill_colors)
    norm = mcolors.BoundaryNorm(fill_levels, cmap.N)
    
    # Color Fill
    # levels=fill_levels ensures we only color >100. Below 100 is transparent/white.
    cf = ax.contourf(X, Y, Z, levels=fill_levels, cmap=cmap, norm=norm, alpha=0.6, extend='max')
    
    # Contour Lines
    line_levels = [70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180]
    CS = ax.contour(X, Y, Z, levels=line_levels, colors='k', linewidths=0.5, alpha=0.3)
    ax.clabel(CS, inline=True, fontsize=8, fmt='%d')
    
    
    # Settings
    ax.set_xlim(x_range)
    ax.set_ylim(y_range)
    # Remove labels and title from image (will add in HTML)
    # ax.set_xlabel(x_label)
    # ax.set_ylabel(y_label)
    # ax.set_title(title)
    ax.grid(True, linestyle='--', alpha=0.5)

    # Remove axes for pure background
    ax.set_axis_off()

    # Manual Grid & Border (since axis is off)
    # Range is 3 to 12. Grid at 3, 6, 9, 12.
    # We want grey lines.
    grid_color = '#888888'
    grid_alpha = 0.5
    linewidth = 0.5

    # Vertical lines
    for gx in [3, 6, 9, 12]:
        ax.axvline(x=gx, color=grid_color, alpha=grid_alpha, linewidth=linewidth, linestyle='--' if gx not in [3, 12] else '-')
    
    # Horizontal lines
    for gy in [3, 6, 9, 12]:
        ax.axhline(y=gy, color=grid_color, alpha=grid_alpha, linewidth=linewidth, linestyle='--' if gy not in [3, 12] else '-')
    
    # Border (solid lines at limits)
    ax.plot([3, 12], [3, 3], color='black', linewidth=1)   # Bottom
    ax.plot([3, 12], [12, 12], color='black', linewidth=1) # Top
    ax.plot([3, 3], [3, 12], color='black', linewidth=1)   # Left
    ax.plot([12, 12], [3, 12], color='black', linewidth=1) # Right

    
    # Tight layout with no padding to ensure 0-100% maps to data range
    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

    
    # Save
    output_path = os.path.join(OUTPUT_DIR, filename)
    plt.savefig(output_path, transparent=False)
    print(f"Saved {output_path}")
    plt.close()

if __name__ == "__main__":
    # Graph 1: Work Stress
    # X: Burden (A1+A2+A3), Range 3-12. (Extended slightly for view: 3-12)
    # Y: Control (A8+A9+A10), Range 3-12. (Extended slightly for view: 3-12)
    generate_graph_image(
        'stress_graph_bg.png',
        'Job Stress Diagram (Burden vs Control)',
        'Quantitative Job Burden',
        'Job Control',
        (A, B, alpha, beta),
        (3, 12),
        (3, 12)
    )

    # Graph 2: Social Support
    # X: Supervisor Support (C1+C4+C7), Range 3-12
    # Y: Coworker Support (C2+C5+C8), Range 3-12
    # Note: Coefficients C, D, gamma, delta
    generate_graph_image(
        'support_graph_bg.png',
        'Social Support Diagram (Supervisor vs Coworker)',
        'Supervisor Support',
        'Coworker Support',
        (C, D, gamma, delta),
        (3, 12),
        (3, 12)
    )
