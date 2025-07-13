import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedList } from './completed-list';

describe('CompletedList', () => {
  let component: CompletedList;
  let fixture: ComponentFixture<CompletedList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletedList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
