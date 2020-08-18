import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Note } from 'src/app/shared/note.model';
import { NotesService } from 'src/app/shared/notes.service';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  animations: [
    trigger('itemAnim', [
      transition('void => *', [
        style({
          height: 0,
          opacity: 0,
          transform: 'scale(0.85)',
          'margin-bottom': 0,

          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
        }),
        animate('50ms', style({
          height: '*',
          'margin-bottom': '*',
          paddingTop: '*',
          paddingBottom: '*',
          paddingRight: '*',
          paddingLeft: '*',
        })),
        animate(100),
      ]),

      transition('* => void', [
        animate(50, style({
          transform: 'scale(1.05)'
        })),
        animate(50, style({
          transform: 'scale(1)',
          opacity: 0.75,
        })),
        animate('120ms ease-out', style({
          transform: 'scale(0.68)',
          opacity: 0, 
        })),
        animate('150ms ease-out', style({
          opacity: 0,
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
          'margin-bottom': '0',
        }))
      ])
    ]),

    trigger('listAnim', [
      transition('* => *', [
        query(':enter', [
          style({
            opacity: 0,
            height: 0,
          }),
          stagger(100, [
            animate('0.2s ease')
          ])
        ], {
          optional: true
        })
      ])
    ])
  ]
})
export class NotesListComponent implements OnInit {

  notes: Note[] = new Array<Note>();
  filteredNotes: Note[] = new Array<Note>();

  @ViewChild('filterInput') filterInputElRef: ElementRef<HTMLInputElement>; 

  constructor(private notesService: NotesService) { }

  ngOnInit(): void {
    // We want to retrieve all notes from NotesService
    this.notes = this.notesService.getAll();
    // this.filteredNotes = this.notesService.getAll();
    this.filter('');
  }

  generateNoteURL(note: Note) {
    let noteID = this.notesService.getID(note);
    return noteID;
  }

  deleteNote(note: Note) {
    let noteID = this.notesService.getID(note);
    this.notesService.delete(noteID);

    this.filter(this.filterInputElRef.nativeElement.value);
  }

  filter(query: string) {
    query = query.toLowerCase().trim();

    let allResults: Note[] = new Array<Note>();

    // split the query into individual words
    let terms: string[] = query.split(' ');

    // remove duplicate search terms
    terms = this.removeDuplicates(terms);

    // compile all relavent results into the allResults array
    terms.forEach(term => {
      let results: Note[] = this.relaventNotes(term);

      // append results to the allResults array
      allResults = [...allResults, ...results];
    });

    // allResults will include duplicate notes
    // because any note can be result of many search terms
    // so remove duplicates
    let uniqueResults = this.removeDuplicates(allResults);

    this.filteredNotes = uniqueResults;

    // now sort by relavency
    this.sortByRelavency(allResults);
  }

  relaventNotes(query: string): Array<Note> {
    query = query.toLowerCase().trim();

    let relaventNotes = this.notes.filter(note => {
      if(note.title && note.title.toLowerCase().includes(query)) {
        return true;
      }

      if(note.body && note.body.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    })

    return relaventNotes;
  }

  sortByRelavency(searchResults: Note[]) {
    let noteCountObj: Object = {};

    searchResults.forEach(note => {
      let noteID = this.notesService.getID(note);

      if(noteCountObj[noteID]) {
        noteCountObj[noteID] += 1;
      } else {
        noteCountObj[noteID] = 1;
      }
    })

    this.filteredNotes = this.filteredNotes.sort((a: Note, b: Note) => {
      let aID = this.notesService.getID(a);
      let bID = this.notesService.getID(b);
      
      let aCount = noteCountObj[aID];
      let bCount = noteCountObj[bID];

      return bCount - aCount;
    })
  }

  removeDuplicates(arr: Array<any>): Array<any> {
    let uniqueResults: Set<any> = new Set<any>();

    // loop through the input array and add the items to the set
    arr.forEach(e => uniqueResults.add(e));

    return Array.from(uniqueResults);
  }

}
