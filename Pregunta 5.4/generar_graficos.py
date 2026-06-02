"""
Genera Burn Up y Burn Down del Sprint 1 de Cardly.
Datos tomados de burn.md del repositorio Back-SW2.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Datos del sprint ──────────────────────────────────────────
dias_label = ['01/04', '03/04', '07/04', '09/04', '13/04', '14/04']
dias_num   = [1, 3, 5, 7, 9, 10]
total      = [42, 42, 42, 42, 42, 42]
completado = [0,  6, 14, 24, 36, 40]

# Burn Down: trabajo restante = total − completado
restante   = [t - c for t, c in zip(total, completado)]
# Ideal: línea recta de 42 a 0 entre día 1 y día 10
ideal      = [42 - 42 * (d - 1) / (10 - 1) for d in dias_num]

PURPLE = '#8b5cf6'
CYAN   = '#22d3ee'
GOLD   = '#f59e0b'
GRAY   = '#94a3b8'
RED    = '#ef4444'

def base_style(ax, title):
    ax.set_facecolor('#f8fafc')
    ax.grid(color='#e2e8f0', linestyle='--', linewidth=0.7, alpha=0.8)
    ax.set_axisbelow(True)
    ax.set_title(title, fontsize=14, fontweight='bold', color='#1e293b', pad=14)
    ax.tick_params(colors='#475569', labelsize=9)
    for spine in ax.spines.values():
        spine.set_edgecolor('#cbd5e1')
    ax.set_xticks(dias_num)
    ax.set_xticklabels(dias_label, fontsize=9, color='#475569')
    ax.set_xlabel('Día del sprint', fontsize=10, color='#475569', labelpad=8)
    ax.set_ylabel('Puntos de historia', fontsize=10, color='#475569', labelpad=8)


# ── 1. BURN UP ────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(9, 5.5))
fig.patch.set_facecolor('white')

ax.plot(dias_num, total, color=GRAY, linewidth=2, linestyle='--',
        label='Trabajo total planificado (42 pts)', zorder=2)

ax.fill_between(dias_num, completado, alpha=0.12, color=PURPLE)
ax.plot(dias_num, completado, color=PURPLE, linewidth=2.5,
        marker='o', markersize=7, markerfacecolor='white',
        markeredgecolor=PURPLE, markeredgewidth=2,
        label='Trabajo completado acumulado', zorder=3)

# Anotar cada punto
for d, c in zip(dias_num, completado):
    ax.annotate(f'{c} pts', xy=(d, c),
                xytext=(0, 10), textcoords='offset points',
                ha='center', fontsize=8, color=PURPLE, fontweight='bold')

# Brecha al final
ax.annotate('', xy=(10, 42), xytext=(10, 40),
            arrowprops=dict(arrowstyle='<->', color=RED, lw=1.5))
ax.text(10.1, 41, '2 pts\npendientes', fontsize=7.5, color=RED, va='center')

base_style(ax, 'Burn Up — Sprint 1 · Cardly')
ax.set_ylim(0, 50)
ax.legend(loc='upper left', fontsize=9, framealpha=0.9,
          facecolor='white', edgecolor='#e2e8f0')

plt.tight_layout()
out = os.path.join(OUTPUT_DIR, 'png', 'burnup_sprint1.png')
plt.savefig(out, dpi=150, bbox_inches='tight', facecolor='white')
plt.close()
print(f'OK Burn Up  ->  {out}')


# ── 2. BURN DOWN ─────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(9, 5.5))
fig.patch.set_facecolor('white')

ax.fill_between(dias_num, ideal, alpha=0.08, color=CYAN)
ax.plot(dias_num, ideal, color=CYAN, linewidth=2, linestyle='--',
        label='Burndown ideal', zorder=2)

ax.fill_between(dias_num, restante, alpha=0.12, color=PURPLE)
ax.plot(dias_num, restante, color=PURPLE, linewidth=2.5,
        marker='o', markersize=7, markerfacecolor='white',
        markeredgecolor=PURPLE, markeredgewidth=2,
        label='Trabajo restante real', zorder=3)

# Anotar cada punto real
for d, r in zip(dias_num, restante):
    ax.annotate(f'{r} pts', xy=(d, r),
                xytext=(0, 10), textcoords='offset points',
                ha='center', fontsize=8, color=PURPLE, fontweight='bold')

# Zona de ventaja (real < ideal → equipo adelantado)
for i in range(len(dias_num) - 1):
    if restante[i] < ideal[i]:
        ax.fill_between(
            [dias_num[i], dias_num[i+1]],
            [restante[i], restante[i+1]],
            [ideal[i], ideal[i+1]],
            alpha=0.10, color=GOLD
        )

gold_patch = mpatches.Patch(color=GOLD, alpha=0.4, label='Adelanto respecto al ideal')

base_style(ax, 'Burn Down — Sprint 1 · Cardly')
ax.set_ylim(0, 50)
ax.legend(handles=[
    plt.Line2D([0], [0], color=CYAN, linewidth=2, linestyle='--', label='Burndown ideal'),
    plt.Line2D([0], [0], color=PURPLE, linewidth=2.5, marker='o',
               markerfacecolor='white', markeredgecolor=PURPLE, label='Trabajo restante real'),
    gold_patch,
], loc='upper right', fontsize=9, framealpha=0.9, facecolor='white', edgecolor='#e2e8f0')

plt.tight_layout()
out = os.path.join(OUTPUT_DIR, 'png', 'burndown_sprint1.png')
plt.savefig(out, dpi=150, bbox_inches='tight', facecolor='white')
plt.close()
print(f'OK Burn Down ->  {out}')

print('\nGraficos generados en Pregunta 5.4/png/')
