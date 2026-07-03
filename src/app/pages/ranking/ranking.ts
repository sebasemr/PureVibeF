import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor
import { RankingService} from '../../services/ranking-service';
import { Ranking} from '../../models/ranking-model';
import {HeaderComponent} from '../../components/header/header'; // (Para el header)

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.css']
})
export class RankingComponent implements OnInit {

  private rankingService = inject(RankingService);

  public rankingList: Ranking[] = [];
  public top3: Ranking[] = [];
  public restoDelRanking: Ranking[] = [];
  public isLoading = true;

  // Avatar generado con iniciales del username
  getAvatarColor(username: string): string {
    const colors = ['#1565C0','#1E88E5','#2E7D32','#43A047','#006064','#00838F','#4527A0','#1565C0'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  getInitials(username: string): string {
    if (!username) return '?';
    const parts = username.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return username.substring(0, 2).toUpperCase();
  }

  ngOnInit(): void {
    this.rankingService.getRanking(0, 10).subscribe({
      next: (data) => {
        this.rankingList = data;

        this.top3 = data.slice(0, 3);
        this.restoDelRanking = data.slice(3);

        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al cargar el ranking:", err);
        this.isLoading = false;
        alert("No se pudo cargar el ranking. (Asegúrate de estar logueado)");
      }
    });
  }


}
