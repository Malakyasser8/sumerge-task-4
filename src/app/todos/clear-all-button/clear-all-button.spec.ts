import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearAllButton } from './clear-all-button';

describe('ClearAllButton', () => {
  let component: ClearAllButton;
  let fixture: ComponentFixture<ClearAllButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearAllButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClearAllButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
