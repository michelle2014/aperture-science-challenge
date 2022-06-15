import React, { useEffect, useState, useContext } from 'react';
import { NextPage, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { parseCookies, resolveApiHost } from "../helpers/";
import useForm from '../helpers/useForm';
import validateEdit from '../helpers/validateEdit';
import AppContext from "../components/appContext";
import Layout from "../components/layout";
import axios from 'axios';
import styles from '../styles/App.module.css';

Edit.getInitialProps = ({ req, res }: NextPageContext) => {
  const cookies = parseCookies(req);
  const { protocol, hostname } = resolveApiHost(req);
  return { XSRF_TOKEN: cookies["XSRF-TOKEN"], hostname, protocol };
}

export default function Edit(props: NextPage & {XSRF_TOKEN: string, hostname: string, protocol: string}) {
  const router = useRouter();
  const [ message, setFormMessage ] = useState('');
  const api = `${props.protocol}//${props.hostname}`;
  const [ authenticated, setAuth ] = useState<Boolean>(!!props.XSRF_TOKEN);
  const context: any = useContext(AppContext);

  const editSubject = async (event: any) => {

    try {
        await axios.post(`${api}/graphql`, {
          query: `
          mutation ($id: ID!, $name: String!, $date_of_birth: DateTime!, $score: Int!, $alive: Boolean!, $test_chamber: Int!, $updated_at: DateTime!) {
            updateSubject (id: $id, name: $name, date_of_birth: $date_of_birth, score: $score, alive: $alive, test_chamber: $test_chamber, updated_at: $updated_at) {
              id
              name
              date_of_birth
              score
              alive
              test_chamber
              updated_at
            }
          }`,
          variables:
            {
              id:event.target.editid.value,
              name:event.target.editname.value,
              date_of_birth:event.target.editdob.value,
              score:parseInt(event.target.editscore.value, 10),
              alive:(event.target.editalive.value === "Y")? true: false,
              test_chamber:parseInt(event.target.editchamber.value, 10),
              updated_at: new Date().toISOString().substring(0,19).replace('T', ' ')},
          withCredentials: true,
        }).then(res => {
            console.log(res);
            router.push('/subjects')})
        .catch(e => {
          if (e.response?.data?.message) {
            setFormMessage(e.response?.data?.message);
          } else {
            setFormMessage('An error occurred, please try again later.')
          }
      });
    } catch (err) {
      setFormMessage('An error occurred, please try again later.')
      console.log(err);
    }
  };

  const { values, errors, handleInputChange, handleSubmit, validateInputs } = useForm(editSubject, validateEdit);

  return (
    <Layout>
      { authenticated && 
      <>
      <h1>Edit subject</h1>
      <section className={styles.content}>
          <form id="edit-subject" onSubmit={handleSubmit} data-testid="edit-subject-form">
            <div className={styles.inputGroup}>
              <label data-testid="id-label" htmlFor="editid">ID</label>
              <input 
                defaultValue={context.session? context.session.id: ''} 
                id="editid" 
                type="number" 
                name="editid" 
                required 
                disabled/>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="editname">Name</label>
              <input 
                onChange={(e) => {context.session.name = values.editname? values.editname: context.session.name; handleInputChange(e)}} 
                onBlur={validateInputs} 
                className={errors.editname ? styles.danger : ""}
                defaultValue={context.session? context.session.name: ''} 
                id="editname" 
                type="text" 
                name="editname" 
                required/>
            </div>
            <div>{errors.editname && (<p style={{color: 'red'}}>{errors.editname}</p>)}</div>
            <div className={styles.inputGroup}>
              <label htmlFor="editdob">DOB</label>
              <input 
                onChange={(e) => {context.session.date_of_birth = values.editdob? values.editdob: context.session.date_of_birth; handleInputChange(e)}} 
                onBlur={validateInputs} 
                className={errors.editdob ? styles.danger : ""} 
                defaultValue={context.session? context.session.date_of_birth: ''} 
                id="editdob" 
                type="text" 
                name="editdob" 
                required/>
            </div>
            <div>{errors.editdob && (<p style={{color: 'red'}}>{errors.editdob}</p>)}</div>
            <div className={styles.inputGroup}>
              <label htmlFor="editscore">Score</label>
              <input 
                onChange={(e) => {context.session.score = values.editscore? values.editscore: context.session.score; handleInputChange(e)}} 
                onBlur={validateInputs} 
                className={errors.editscore ? styles.danger : ""} 
                defaultValue={context.session? context.session.score: ''} 
                id="editscore" 
                type="number" 
                name="editscore" 
                required/>
            </div>
            <div>{errors.editscore && (<p style={{color: 'red'}}>{errors.editscore}</p>)}</div>
            <div className={styles.inputGroup}>
              <label htmlFor="editalive">Alive</label>
              <input 
                onChange={(e) => {context.session.alive = values.editalive? values.editalive: context.session.alive; handleInputChange(e)}} 
                onBlur={validateInputs} 
                className={errors.editalive ? styles.danger : ""} 
                defaultValue={context.session? context.session.alive: ''} 
                id="editalive" 
                type="text" 
                name="editalive" 
                required/>
            </div>
            <div>{errors.editalive && (<p style={{color: 'red'}}>{errors.editalive}</p>)}</div>
            <div className={styles.inputGroup}>
              <label htmlFor="editchamber">Chamber</label>
              <input 
                onChange={(e) => {context.session.test_chamber = values.editchamber? values.editchamber: context.session.test_chamber; handleInputChange(e)}} 
                onBlur={validateInputs} 
                className={errors.editchamber ? styles.danger : ""} 
                defaultValue={context.session? context.session.test_chamber: ''} 
                id="editchamber" 
                type="number" 
                name="editchamber" 
                required/>
            </div>
            <div>{errors.editchamber && (<p style={{color: 'red'}}>{errors.editchamber}</p>)}</div>
            {message && (
              <p data-testid="error-msg">{message}</p>
            )}
            <div className={styles.inputGroup}>
              <input id="edit" type="submit"/>
            </div>
          </form>
        </section>
        </>}
        { !authenticated && <h1 style={{color: "white"}}>Please log in to edit a subject</h1>}
      </Layout>
  );
}
