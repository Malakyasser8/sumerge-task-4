import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient} from '@angular/common/http';

import { CompletedItem } from './completed-item';

describe('CompletedItem', () => {
  let component: CompletedItem;
  let fixture: ComponentFixture<CompletedItem>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    mockHttpClient = jasmine.createSpyObj('HttpClient', ['post']);

    await TestBed.configureTestingModule({
      imports: [CompletedItem],
      providers: [{ provide: HttpClient, useValue: mockHttpClient }],
    }).compileComponents();

    fixture = TestBed.createComponent(CompletedItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display complete item title correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    component.completeItemTitle = '1. Test';
    fixture.detectChanges();

    expect(compiled.querySelector('label')?.textContent).toContain('1. Test');
  });
});
