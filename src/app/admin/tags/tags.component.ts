import {Component, OnInit} from '@angular/core';
import {TagService} from '@core/services/tag.service';
import {NgForOf, NgIf} from '@angular/common';
import {Tag} from '@core/models/tag.model';
import {MessageComponent} from '../../shared/message/message.component';
import {ConfirmationDialogComponent} from '../../shared/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-tags',
  imports: [
    NgIf,
    NgForOf,
    MessageComponent
  ],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.css'
})
export class TagsComponent implements OnInit {
  tags: Tag[] = [];
  errorMessage: string | null = null;

  constructor(private tagService: TagService, protected dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.tagService.getAllTags().subscribe({
      next: (data) => this.tags = data,
      error: (err) => this.errorMessage = 'Failed to load tags'
    });
  }

  deleteTag(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Tag',
        message: 'Are you sure you want to delete this tag?'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.tagService.deleteTag(id).subscribe({
          next: () => this.loadTags(),
          error: err => {
            this.errorMessage = 'An error occurred while deleting the tag';
          }
        });
      }
    });
  }
}
