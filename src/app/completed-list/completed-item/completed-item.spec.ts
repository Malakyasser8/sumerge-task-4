import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedItem } from './completed-item';

describe('CompletedItem', () => {
  let component: CompletedItem;
  let fixture: ComponentFixture<CompletedItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletedItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
