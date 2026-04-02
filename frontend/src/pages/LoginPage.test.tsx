import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from './LoginPage'

describe('LoginPage — user authentication', () => {
  describe('rendering', () => {
    it('should contain a sign in heading', () => {
      render(<LoginPage />)

      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    })

    it('user can enter username and password', async () => {
      render(<LoginPage />)
      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/username/i), 'admin')
      await user.type(screen.getByLabelText(/password/i), 'secret')

      expect(screen.getByLabelText(/username/i)).toHaveValue('admin')
      expect(screen.getByLabelText(/password/i)).toHaveValue('secret')
    })

    it('there should be an option to sign in', () => {
      render(<LoginPage />)

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('does not show error or success messages on initial render', () => {
      render(<LoginPage />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })
})

