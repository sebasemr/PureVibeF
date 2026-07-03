import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { HeaderComponent } from '../../components/header/header';

interface ReporteTransporteDTO {
  actividadId: number;
  transporteId: number;
  fecha: string;
  medio: string;
  tipoCombustible: string;
  distanciaKm: number;
  consumoLitros100km: number;
  descripcion: string;
}

@Component({
  selector: 'app-reporte-transporte',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './reporte-transporte.component.html',
  styleUrl: './reporte-transporte.component.css'
})
export class ReporteTransporteComponent implements OnInit {

  private apiUrl = 'http://localhost:8080/api/reporte-transporte';

  // Filtros
  tipoCombustible = '';
  distanciaMinKm: number | null = null;
  distanciaMaxKm: number | null = null;

  tiposCombustible = [
    { valor: '',  label: 'Todos' },
    { valor: 'G', label: 'Gasolina (G)' },
    { valor: 'D', label: 'Diésel (D)' },
    { valor: 'E', label: 'Eléctrico (E)' },
    { valor: 'H', label: 'Híbrido (H)' },
  ];

  reporte: ReporteTransporteDTO[] = [];
  loading = false;
  error = '';
  buscado = false;

  // Resumen calculado
  get totalKm(): number {
    return this.reporte.reduce((s, r) => s + Number(r.distanciaKm || 0), 0);
  }
  get totalConsumo(): number {
    return this.reporte.reduce((s, r) => s + Number(r.consumoLitros100km || 0), 0);
  }
  get medios(): string {
    const unicos = [...new Set(this.reporte.map(r => r.medio))];
    return unicos.join(', ') || '—';
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.buscar();
  }

  getUsuarioId(): number {
    return Number(localStorage.getItem('usuarioId') || 1);
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  buscar(): void {
    this.loading = true;
    this.error = '';
    this.buscado = true;

    let params = new HttpParams().set('usuarioId', this.getUsuarioId().toString());
    if (this.tipoCombustible) params = params.set('tipoCombustible', this.tipoCombustible);
    if (this.distanciaMinKm !== null && this.distanciaMinKm !== undefined)
      params = params.set('distanciaMinKm', this.distanciaMinKm.toString());
    if (this.distanciaMaxKm !== null && this.distanciaMaxKm !== undefined)
      params = params.set('distanciaMaxKm', this.distanciaMaxKm.toString());

    this.http.get<ReporteTransporteDTO[]>(this.apiUrl, {
      headers: this.getHeaders(),
      params
    }).subscribe({
      next: (data) => {
        this.reporte = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cargar el reporte. Verifica la conexión al servidor.';
        this.loading = false;
      }
    });
  }

  limpiarFiltros(): void {
    this.tipoCombustible = '';
    this.distanciaMinKm = null;
    this.distanciaMaxKm = null;
    this.buscar();
  }

  getCombustibleLabel(codigo: string): string {
    const m: Record<string, string> = { G: 'Gasolina', D: 'Diésel', E: 'Eléctrico', H: 'Híbrido' };
    return m[codigo] || codigo || '—';
  }

  getMedioIcon(medio: string): string {
    const m: Record<string, string> = {
      'AUTO': 'fa-car',
      'MOTO': 'fa-motorcycle',
      'BUS':  'fa-bus',
      'BICICLETA': 'fa-bicycle',
      'AVION': 'fa-plane',
      'TREN': 'fa-train',
    };
    return m[medio?.toUpperCase()] || 'fa-car';
  }

  getCombustibleColor(c: string): string {
    const m: Record<string, string> = { G: '#1565C0', D: '#6D4C41', E: '#2E7D32', H: '#6A1B9A' };
    return m[c] || '#607D8B';
  }
}
