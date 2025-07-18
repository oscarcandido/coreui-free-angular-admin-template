import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoPopListComponent } from './tipo-pop-list.component';

describe('TipoPopListComponent', () => {
  let component: TipoPopListComponent;
  let fixture: ComponentFixture<TipoPopListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoPopListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoPopListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
