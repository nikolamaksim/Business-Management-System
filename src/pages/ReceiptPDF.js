import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 10,
    color: '#333',
    textTransform: 'uppercase',
  },
  contact: {
    fontSize: 14,
    marginBottom: 10,
    color: '#777',
  },
  sectionContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    width: '48%',
    borderRadius: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  fullsection: {
    backgroundColor: '#fff',
    padding: 20,
    width: '60%',
    borderRadius: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textTransform: 'capitalize',
  },
  sectionContent: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
});

const ReceiptPDF = ({ sales }) => (

  <Document>
    <Page size="A4" style={styles.page}>
      <View style={{...styles.header, backgroundColor:'gray'}}>
        <Text style={{...styles.title, color: 'white'}}>RAZ AUTO SALE</Text>
        <Text style={{...styles.contact, color: 'white'}}>Contactez-nous: razackissa@gmail.com | +229 62 31 34 95</Text>
      </View>
      <View style={styles.header}>
        <Text style={{...styles.sectionContent, textAlign: 'left'}}>Vous avez acheté votre voiture de</Text>
        <Text style={styles.sectionTitle}>{sales.manufacturer} {sales.model}({sales.year})</Text>
        <Text style={styles.sectionTitle}>VIN: {sales.vin} </Text>
      </View>
      <View style={styles.sectionContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text style={styles.sectionContent}>{sales.customerName}</Text>
          <Text style={styles.sectionContent}>Numéro de téléphone: {sales.phoneNumber}</Text>
          <Text style={styles.sectionContent}>E-mail: {sales.email}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du contrat</Text>
          <Text style={styles.sectionContent}>Type de paiement: {sales.paymentType}</Text>
          <Text style={styles.sectionContent}>Prix ​total/$: {sales.price}</Text>
          <Text style={{...styles.sectionContent, fontWeight:'bold', color: 'orange'}}>Solde impayé/$: {parseInt(sales.price) - sales.income.reduce((sum, a) => sum += parseInt(a), 0)}</Text>
        </View>
      </View>
      <View style={styles.sectionContainer}>
        <View style={styles.fullsection}>
          <Text style={styles.sectionTitle}>Historique de paiement</Text>
          {Array.from({ length: sales.income.length }, (_, index) => index).map((i) => {
            return (
              <Text style={styles.sectionContent}>{sales.salesDate[i]}: ${sales.income[i]}</Text>
            )
          })}
        </View>
      </View>
      <View style={{...styles.header, backgroundColor: 'gray', position:'absolute', bottom: 0, width: '100%'}}>
        <Text style={{...styles.sectionTitle, color: 'white'}}>Merci d'être venu avec notre entreprise.</Text>
        <Text style={{...styles.sectionContent, color: 'white'}}>{new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
);

export default ReceiptPDF;

