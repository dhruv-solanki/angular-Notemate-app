import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Note } from '../../shared/note.model';
import { NotesService } from '../../shared/notes.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-note-details',
  templateUrl: './note-details.component.html',
  styleUrls: ['./note-details.component.scss']
})
export class NoteDetailsComponent implements OnInit {

  note: Note;
  noteID: number;
  isNew: boolean;

  constructor(private noteService: NotesService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // We want to find out if we are creating a new note or updating existing one
    this.route.params.subscribe((params: Params) => {
      this.note = new Note();
      if(params.id) {
        this.note = this.noteService.get(params.id);
        this.noteID = params.id;
        this.isNew = false;
      } else {
        this.isNew = true;
      }
    });
  }

  onSubmit(form: NgForm) {
    // If isNew = true Save the note
    if(this.isNew) {
      this.noteService.add(form.value);
    } else {
      // Update the current note by id
      this.noteService.update(this.noteID, form.value.title, form.value.body);
    }
    this.router.navigateByUrl('/');
  }

  onCancel() {
    this.router.navigateByUrl('/');
  }
}
