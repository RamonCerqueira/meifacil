import { render, screen } from '@testing-library/react'
import { Button } from './ui/button'

describe("Button", () => {
  it("should render with default variant and size", () => {
    render(<Button>Test Button</Button>)
    const button = screen.getByText("Test Button")
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass("bg-primary text-primary-foreground")
  })

  it("should render with a different variant", () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    const button = screen.getByText("Secondary Button")
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass("bg-secondary text-secondary-foreground")
  })

  it("should render with a different size", () => {
    render(<Button size="lg">Large Button</Button>)
    const button = screen.getByText("Large Button")
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass("h-10 px-8")
  })

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByText("Disabled Button")
    expect(button).toBeDisabled()
  })
})

