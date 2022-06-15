/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { getPage } from 'next-page-tester';

 describe('Home', () => {
  beforeEach(async () => {
    const { render } = await getPage({
      route: '/',
    });
    await render();
  })

   it('renders a heading', () => {
     const heading = screen.getByRole('heading', {
       name: "Please login",
     })
 
     expect(heading).toBeInTheDocument();
   })

   it('renders a login form', () => {
    const form = screen.getByTestId("login-form");
    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');
    expect(form).toBeInTheDocument();
    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
  })
 })