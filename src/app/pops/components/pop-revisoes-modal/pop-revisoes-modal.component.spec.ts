import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopRevisoesModalComponent } from './pop-revisoes-modal.component';

describe('PopRevisoesModalComponent', () => {
  let component: PopRevisoesModalComponent;
  let fixture: ComponentFixture<PopRevisoesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopRevisoesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopRevisoesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
