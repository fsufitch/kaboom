package kaboomserver

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/fsufitch/kaboom"
	"github.com/fsufitch/kaboom/classic"
)

func getVariantParam(r *http.Request) (string, error) {
	variant := strings.ToLower(r.URL.Query().Get("variant"))
	if variant == "" {
		return "", fmt.Errorf("variant query parameter is required")
	}
	return variant, nil
}

func adjudicatorForVariant(name string) (*kaboom.VariantAdjudicator, error) {
	switch name {
	case classic.ClassicRulesVariant:
		return &classic.ClassicChessVariantAdjudicator, nil
	default:
		return nil, fmt.Errorf("unsupported game variant")
	}
}
