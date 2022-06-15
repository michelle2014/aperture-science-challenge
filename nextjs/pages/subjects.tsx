
import React, { useEffect, useState, useContext } from 'react';
import { NextPage, NextPageContext  } from 'next';
import { useCookies } from "react-cookie";
import { parseCookies, resolveApiHost } from "../helpers/";
import { useRouter } from 'next/router';
import AppContext from "../components/appContext";
import Layout from "../components/layout";
import Link from 'next/link';
import axios from 'axios';
import styles from '../styles/App.module.css';

interface Subject {
  id: number,
  name: string,
  test_chamber?: number,
  date_of_birth?: string,
  score?: number,
  alive?: boolean,
  created_at?: string,
  updated_at?: string
}

Subjects.getInitialProps = ({ req, res }: NextPageContext) => {
  const cookies = parseCookies(req);
  const { protocol, hostname } = resolveApiHost(req);
  return { XSRF_TOKEN: cookies["XSRF-TOKEN"], hostname, protocol };
}

export default function Subjects(props: NextPage & {XSRF_TOKEN: string, hostname: string, protocol:string}) {
  const router = useRouter();
  const [ authenticated, setAuth ] = useState<Boolean>(!!props.XSRF_TOKEN);
  const [ subjects, setSubjects ] = useState<Array<Subject>>();
  const [ message, setErrorMessage ] = useState<string>('');
  const [cookie, setCookie, removeCookie] = useCookies(["XSRF-TOKEN"]);
  const api = `${props.protocol}//${props.hostname}`;
  const context: any = useContext(AppContext);
  const [state, setState] = useState({});

  const logout = async () => {
    try {
      await axios({
        method: "post",
        url: `${api}/logout`,
        withCredentials: true
      }).then((response) => {
        removeCookie("XSRF-TOKEN");
        setAuth(!(response.status === 204))
        return router.push('/');
      })
    } catch (e) {
      console.log(e);
    }
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) {
      return '???'
    }
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
  }

  const create = () => {
    router.push('/create');
  }

  const destroy = async (subject_id: number) => {
  
    try {
        await axios.post(`${api}/graphql`, {
          query: `
          mutation ($id: ID!) {
            deleteSubject (id: $id) {
              id
            }
          }`,
          variables:
            {
              id:subject_id,
            },
          withCredentials: true,
        }).then(() => {
            router.push('/subjects');
            window.location.reload();
          })
        .catch(e => {
          if (e.response?.data?.message) {
            setErrorMessage(e.response?.data?.message);
          } else {
            setErrorMessage('An error occurred, please try again later.')
          }
      });
    } catch (err) {
      setErrorMessage('An error occurred, please try again later.')
    }
  }

  useEffect(() => {

    if (authenticated) {
      axios.post(
        `${api}/graphql`,
        {
          query: `
              query {
                subjects {
                  id
                  name
                  test_chamber
                  date_of_birth
                  score
                  alive
                  created_at
                }
              }
            `
        },
        { withCredentials: true }
      ).then(response => {
        const { subjects = [] } = response.data?.data;
        if (subjects && subjects.length > 0) {
          return setSubjects(subjects as Subject[]);
        }
      }).catch((e) => {
        console.log(e);
        if (e.response?.data?.message) {
          if (e.response?.data?.message === "CSRF token mismatch.") {
            return setErrorMessage("Your session has expired, please log in again.");
          } else {
            return setErrorMessage(e.response?.data?.message);
          }
        } else {
          return setErrorMessage('An error occurred, please try again later.')
        }
      })
    } else {
      router.push('/');
      return () => {
        setState({}); 
      };
    }
  }, [authenticated]);

  return (
    <Layout>
      <h1>Testing Subjects
        <span>
          <button 
            onClick={create} 
            id="create-subject"
            className={styles.createSubject}>Create subject
          </button>
        </span>
      </h1>
      <section className={styles.content}>
        {message && (
          <p data-testid="error-msg">{message}</p>
        )}
        {subjects && subjects.length > 0 && (
          <table data-testid="subjects-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>DOB</th>
                <th>Alive</th>
                <th>Score</th>
                <th>Test Chamber</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(subject => (
                <tr key={subject.id}>
                  <td>{subject.id}</td>
                  <td 
                    onClick={() => {context.setSession(subject); router.push('/edit')}} 
                    className={styles.editSubject}>
                    <Link  
                      href="/edit">{subject.name}
                    </Link></td>
                  <td>{formatDate(subject.date_of_birth)}</td>
                  <td>{subject.alive ? 'Y' : 'N'}</td>
                  <td>{subject.score}</td>
                  <td>{subject.test_chamber}</td>
                  <td>
                    <button
                      id="delete-subject"
                      onClick={() => {destroy(subject.id); }}>Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!subjects && !message && (
          <div className={styles.skeleton} data-testid="skeleton">
            <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>DOB</th>
                <th>Alive</th>
                <th>Score</th>
                <th>Test Chamber</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(Array(10).keys()).map(subject => (
                <tr key={subject}>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        {authenticated && <button onClick={logout}>Log out</button>}
      </section>
    </Layout>
  )
}
