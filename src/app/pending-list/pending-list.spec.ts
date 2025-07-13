import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingList } from './pending-list';

describe('PendingList', () => {
  let component: PendingList;
  let fixture: ComponentFixture<PendingList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
