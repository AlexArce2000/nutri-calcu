import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MacroDistributionComponent } from './macro-distribution.component';

describe('MacroDistributionComponent', () => {
  let component: MacroDistributionComponent;
  let fixture: ComponentFixture<MacroDistributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MacroDistributionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MacroDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
