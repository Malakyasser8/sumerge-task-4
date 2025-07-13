import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingItem } from './pending-item';

describe('PendingItem', () => {
  let component: PendingItem;
  let fixture: ComponentFixture<PendingItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
