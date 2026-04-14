package models

import (
	"time"

	"gorm.io/gorm"
)

// ── User ──────────────────────────────────────────────────────

type User struct {
	gorm.Model
	Name            string `gorm:"not null"`
	Email           string `gorm:"uniqueIndex;not null"`
	PasswordHash    string `gorm:"not null"`
	CurrencyCode    string `gorm:"default:'EUR'"`
	CurrencySymbol  string `gorm:"default:'€'"`
	MonthlyBudget   float64 `gorm:"default:1500"`
	Theme           string  `gorm:"default:'midnight'"`
	XP              int     `gorm:"default:0"`
	Level           int     `gorm:"default:1"`
	Onboarded       bool    `gorm:"default:false"`

	Transactions  []Transaction  `gorm:"foreignKey:UserID"`
	Subscriptions []Subscription `gorm:"foreignKey:UserID"`
	Goals         []Goal         `gorm:"foreignKey:UserID"`
	Budgets       []Budget       `gorm:"foreignKey:UserID"`
}

// ── Transaction ───────────────────────────────────────────────

type Transaction struct {
	gorm.Model
	UserID    uint      `gorm:"not null;index"`
	Name      string    `gorm:"not null"`
	Category  string    `gorm:"not null;default:'other'"`
	Icon      string    `gorm:"default:'📦'"`
	Amount    float64   `gorm:"not null"` // negative = expense, positive = income
	Currency  string    `gorm:"default:'EUR'"`
	Date      time.Time `gorm:"not null"`
	IsIncome  bool      `gorm:"default:false"`
	Note      string
	Recurring bool `gorm:"default:false"`
}

// ── Subscription ──────────────────────────────────────────────

type Subscription struct {
	gorm.Model
	UserID    uint    `gorm:"not null;index"`
	Name      string  `gorm:"not null"`
	Icon      string  `gorm:"default:'📱'"`
	Amount    float64 `gorm:"not null"`
	Currency  string  `gorm:"default:'EUR'"`
	CycleDay  int     // day of month the charge hits
	CycleNote string  // e.g. "Monthly · 7th"
	Active    bool    `gorm:"default:true"`
}

// ── Goal ──────────────────────────────────────────────────────

type Goal struct {
	gorm.Model
	UserID     uint    `gorm:"not null;index"`
	Name       string  `gorm:"not null"`
	Icon       string  `gorm:"default:'🎯'"`
	Target     float64 `gorm:"not null"`
	Saved      float64 `gorm:"default:0"`
	Monthly    float64 // monthly contribution
	Currency   string  `gorm:"default:'EUR'"`
	Completed  bool    `gorm:"default:false"`
	Deadline   *time.Time
}

// ── Budget ────────────────────────────────────────────────────

type Budget struct {
	gorm.Model
	UserID   uint    `gorm:"not null;index"`
	Category string  `gorm:"not null"`
	Icon     string  `gorm:"default:'📦'"`
	Limit    float64 `gorm:"not null"`
	Spent    float64 `gorm:"default:0"`
	Month    string  // "2025-03"
}

// ── API response types (no password hash) ────────────────────

type UserResponse struct {
	ID             uint      `json:"id"`
	Name           string    `json:"name"`
	Email          string    `json:"email"`
	CurrencyCode   string    `json:"currency_code"`
	CurrencySymbol string    `json:"currency_symbol"`
	MonthlyBudget  float64   `json:"monthly_budget"`
	Theme          string    `json:"theme"`
	XP             int       `json:"xp"`
	Level          int       `json:"level"`
	Onboarded      bool      `json:"onboarded"`
	CreatedAt      time.Time `json:"created_at"`
}

func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:             u.ID,
		Name:           u.Name,
		Email:          u.Email,
		CurrencyCode:   u.CurrencyCode,
		CurrencySymbol: u.CurrencySymbol,
		MonthlyBudget:  u.MonthlyBudget,
		Theme:          u.Theme,
		XP:             u.XP,
		Level:          u.Level,
		Onboarded:      u.Onboarded,
		CreatedAt:      u.CreatedAt,
	}
}
