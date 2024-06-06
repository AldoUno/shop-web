import React from "react";
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        margin: 10,
    },
    header: {
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 10,
    },
    section: {
        flexGrow: 1,
        fontSize: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: '40%',
        fontWeight: 'bold',
    },
    value: {
        width: '60%',
    },
    signature: {
        marginTop: 20,
    },

    table: {
        display: 'table',
        width: '95%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 0,
        margin: '10px 0'
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableColHeader: {
        borderStyle: 'solid',
        borderBottomWidth: 1,
        backgroundColor: '#D9E3F0',
        alignItems: 'center',
        fontWeight: 'bold',
    },
    tableCol: {
        borderStyle: 'solid',
        borderBottomWidth: 1,
        alignItems: 'center',
    },
});

// Create Document Component
const PDFFile = ({ data }) => {
    const getFormatDate = (date) => {
        const fecha = new Date(date);

        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();
        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        const segundos = fecha.getSeconds().toString().padStart(2, '0');

        return `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;

    }

    const formatNumberWithCommas = (number = 0) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>Nota de Crédito Nº {data?.number}</Text>
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Denominación: </Text>
                        <Text style={styles.value}>{data?.client?.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>RUC:</Text>
                        <Text style={styles.value}>{data?.taxNumber}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Dirección: </Text>
                        <Text style={styles.value}>{data?.client?.address}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nro. Factura:</Text>
                        <Text style={styles.value}>{data?.invoiceNumber}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha:</Text>
                        <Text style={styles.value}>{getFormatDate(data?.date)}</Text>
                    </View>
                    {/* Agrega más detalles de la nota de crédito aquí */}
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <View style={{ ...styles.tableColHeader, width: '17%'}}>
                                <Text style={styles.tableCell}>Cod Producto</Text>
                            </View>
                            <View style={{ ...styles.tableColHeader, width: '20%'}}>
                                <Text style={styles.tableCell}>Descripción</Text>
                            </View>
                            <View style={{ ...styles.tableColHeader, width: '12%'}}>
                                <Text style={styles.tableCell}>Cantidad</Text>
                            </View>
                            <View style={{ ...styles.tableColHeader, width: '12%'}}>
                                <Text style={styles.tableCell}>Excentas</Text>
                            </View>
                            <View style={{ ...styles.tableColHeader, width: '12%'}}>
                                <Text style={styles.tableCell}>IVA 5%</Text>
                            </View>
                            <View style={{ ...styles.tableColHeader, width: '12%'}}>
                                <Text style={styles.tableCell}>IVA 10%</Text>
                            </View>
                            <View style={{ ...styles.tableColHeader, width: '15%'}}>
                                <Text style={styles.tableCell}>Subtotal</Text>
                            </View>
                        </View>
                        {/* Datos de la tabla */}
                        {
                            data?.details.map(data => {
                                return (
                                    <View style={styles.tableRow} key={data.productCode}>
                                        <View style={{ ...styles.tableCol, width: '17%'}}>
                                            <Text style={styles.tableCell}>{data?.productCode ? data?.productCode : 0}</Text>
                                        </View>
                                        <View style={{ ...styles.tableCol, width: '20%'}}>
                                            <Text style={styles.tableCell}>{data?.productCode ? data?.productCode : 0}</Text>
                                        </View>
                                        <View style={{ ...styles.tableCol, width: '12%'}}>
                                            <Text style={styles.tableCell}>{data?.quantity ? data?.quantity : 0}</Text>
                                        </View>
                                        <View style={{ ...styles.tableCol, width: '12%'}}>
                                            <Text style={styles.tableCell}>{formatNumberWithCommas(data?.taxExemptTotal)}</Text>
                                        </View>
                                        <View style={{ ...styles.tableCol, width: '12%'}}>
                                            <Text style={styles.tableCell}>{formatNumberWithCommas(data?.iva5Amount)}</Text>
                                        </View>
                                        <View style={{ ...styles.tableCol, width: '12%'}}>
                                            <Text style={styles.tableCell}>{formatNumberWithCommas(data?.iva10Amount)}</Text>
                                        </View>
                                        <View style={{ ...styles.tableCol, width: '15%'}}>
                                            <Text style={styles.tableCell}>{formatNumberWithCommas(data?.subtotal)}</Text>
                                        </View>
                                    </View>
                                )
                            })
                        }
                    </View>


                    <View style={styles.row}>
                        <Text style={styles.label}>Total IVA</Text>
                        <Text style={styles.value}>{data?.ivaAmount}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Total</Text>
                        <Text style={styles.value}>{data?.amount}</Text>
                    </View>
                </View>
            </Page>
        </Document >
    )
}

export default PDFFile