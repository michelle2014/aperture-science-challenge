/**
 * @jest-environment jsdom
 */

 import { screen, waitFor } from '@testing-library/react'
 import { getPage } from 'next-page-tester';

 describe('Create page, with session cookie', () => {
 
    const setup = async function(cookie:string) {
        document.cookie = `XSRF-TOKEN=${cookie}`;
          const { render } = await getPage({
            route: '/create',
        });
        render();
    }

   it('renders a heading', async () => {
    await setup('abc')
    await waitFor(() => {
        expect(screen.getByText('Create new subject')).toBeInTheDocument();
    });
   });

   it('renders a create form', async () => {
    await setup('abc')
    await waitFor(() => {
        const form = screen.getByTestId("create-subject-form");
        const name = screen.getByLabelText('Name');
        const dob = screen.getByLabelText('DOB');
        const score = screen.getByLabelText('Score');
        const alive = screen.getByLabelText('Alive');
        const chamber = screen.getByLabelText('Chamber');
        expect(form).toBeInTheDocument();
        expect(name).toBeInTheDocument();
        expect(dob).toBeInTheDocument();
        expect(score).toBeInTheDocument();
        expect(alive).toBeInTheDocument();
        expect(chamber).toBeInTheDocument();
    });
  })
 });