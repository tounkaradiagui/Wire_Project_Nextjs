import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
  },

  section: {
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  box: {
    border: "1px solid black",
    padding: 5,
    width: "30%",
    textAlign: "center",
  },

  statsBox: {
    border: "1px solid black",
    padding: 5,
    marginTop: 5,
  },

  footer: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "bold",
  },
});

export const BulletinPDF = ({
  student,
  averages,
  stats,
  rank,
  appreciation,
}: any) => (
  <Document>
    <Page style={styles.page}>

      {/* Moyennes trimestrielles */}
      <View style={styles.row}>
        <Text style={styles.box}>Moy T1: {averages.t1}</Text>
        <Text style={styles.box}>Moy T2: {averages.t2}</Text>
        <Text style={styles.box}>Moy T3: {averages.t3}</Text>
      </View>

      {/* Statistiques */}
      <View style={styles.statsBox}>
        <Text>
          Plus forte moyenne: {stats.max} | Moyenne classe: {stats.avg} | Plus faible: {stats.min}
        </Text>
      </View>

      {/* Rang */}
      <View style={styles.section}>
        <Text>
          Rang: {rank.position} / {rank.total} élèves
        </Text>
      </View>

      {/* Appréciation */}
      <View style={styles.section}>
        <Text>APPRECIATION :</Text>
        <Text>{appreciation}</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        TABLEAU D’HONNEUR
      </Text>

    </Page>
  </Document>
);