/**
 * @jest-environment jsdom
 */

 import { screen, waitFor } from '@testing-library/react'
 import { getPage } from 'next-page-tester';
 
 describe('Edit page, with session cookie', () => {
 
    const setup = async function(cookie:string) {
        document.cookie = `XSRF-TOKEN=${cookie}`;
          const { render } = await getPage({
            route: '/edit',
        });
        render();
    }

   it('renders a heading', async () => {
    await setup('abc')
    await waitFor(() => {
        expect(screen.getByText('Edit subject')).toBeInTheDocument();
    });
   });

   it('renders an edit form', async () => {
    await setup('abc')
    await waitFor(() => {
        const form = screen.getByTestId("edit-subject-form");
        const id = screen.getByLabelText('ID');
        const name = screen.getByLabelText('Name');
        const dob = screen.getByLabelText('DOB');
        const score = screen.getByLabelText('Score');
        const alive = screen.getByLabelText('Alive');
        const chamber = screen.getByLabelText('Chamber');
        expect(form).toBeInTheDocument();
        expect(id).toBeInTheDocument();
        expect(name).toBeInTheDocument();
        expect(dob).toBeInTheDocument();
        expect(score).toBeInTheDocument();
        expect(alive).toBeInTheDocument();
        expect(chamber).toBeInTheDocument();
    });
  })
 });