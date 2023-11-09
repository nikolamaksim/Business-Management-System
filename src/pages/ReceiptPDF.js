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
        <Text style={{...styles.contact, color: 'white'}}>Contact Details: razackissa@gmail.com | 123-456-7890</Text>
      </View>
      <View style={styles.header}>
        <Text style={{...styles.sectionContent, textAlign: 'left'}}>You bought our car of</Text>
        <Text style={styles.title}>{sales.vin}</Text>
      </View>
      <View style={styles.sectionContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <Text style={styles.sectionContent}>Phone Number: {sales.phoneNumber}</Text>
          <Text style={styles.sectionContent}>Email: {sales.email}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contract Details</Text>
          <Text style={styles.sectionContent}>Payment Type: {sales.paymentType}</Text>
          <Text style={styles.sectionContent}>Total Price/$: {sales.price}</Text>
          <Text style={{...styles.sectionContent, fontWeight:'bold', color: 'orange'}}>OutStanding Balance/$: {parseInt(sales.price) - sales.income.reduce((sum, a) => sum += parseInt(a), 0)}</Text>
        </View>
      </View>
      <View style={styles.sectionContainer}>
        <View style={styles.fullsection}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          {Array.from({ length: sales.income.length }, (_, index) => index).map((i) => {
            return (
              <Text style={styles.sectionContent}>{sales.salesDate[i]}: ${sales.income[i]}</Text>
            )
          })}
        </View>
      </View>
      <View style={{...styles.header, backgroundColor: 'gray', position:'absolute', bottom: 0, width: '100%'}}>
        <Text style={{...styles.sectionTitle, color: 'white'}}>Thanks For Going With Our Business.</Text>
        <Text style={{...styles.sectionContent, color: 'white'}}>{new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
);

export default ReceiptPDF;

