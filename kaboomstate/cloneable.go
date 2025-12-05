package kaboomstate

// Cloneable is a helper constraint for wrapper structs that implement Clone().
type Cloneable[T any] interface {
	Clone() T
}

// cloneMany returns a shallow copy of the provided slice where each element is cloned.
func cloneMany[T Cloneable[T]](items []T) []T {
	if len(items) == 0 {
		return nil
	}

	cloned := make([]T, len(items))
	for i, item := range items {
		cloned[i] = item.Clone()
	}
	return cloned
}
