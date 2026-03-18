import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncapCalculatorComponent } from './incap-calculator.component';

describe('IncapCalculatorComponent', () => {
  let component: IncapCalculatorComponent;
  let fixture: ComponentFixture<IncapCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncapCalculatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncapCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
