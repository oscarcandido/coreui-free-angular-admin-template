import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopListComponent } from './pop-list.component';

describe('PopListComponent', () => {
  let component: PopListComponent;
  let fixture: ComponentFixture<PopListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
