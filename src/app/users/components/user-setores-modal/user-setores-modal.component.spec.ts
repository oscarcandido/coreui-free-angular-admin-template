import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSetoresModalComponent } from './user-setores-modal.component';

describe('UserSetoresModalComponent', () => {
  let component: UserSetoresModalComponent;
  let fixture: ComponentFixture<UserSetoresModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSetoresModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSetoresModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
