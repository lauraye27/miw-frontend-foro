import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [
    NgIf,
    NgForOf
  ],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 0;
  @Input() totalPages: number = 0;
  @Input() maxVisiblePages: number = 3;

  @Output() pageChange = new EventEmitter<number>();

  visiblePages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.updateVisiblePages();
  }

  private updateVisiblePages(): void {
    this.visiblePages = [];

    if (this.totalPages <= this.maxVisiblePages) {
      for (let i = 0; i < this.totalPages; i++) {
        this.visiblePages.push(i);
      }
    } else {
      let start = Math.max(0, this.currentPage - Math.floor(this.maxVisiblePages / 2));
      let end = Math.min(this.totalPages - 1, start + this.maxVisiblePages - 1);

      if (end === this.totalPages - 1) {
        start = Math.max(0, end - this.maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        this.visiblePages.push(i);
      }
    }
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
