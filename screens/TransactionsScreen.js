import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan. Silakan login.");

      const res = await fetch("http://10.171.234.77:8080/api/v1/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Transaksi Tidak Ditemukan");

      const data = await res.json();
      const dataArray = Array.isArray(data) ? data : data.data || [];
      const dataWithId = dataArray.map((item, index) => ({
        id: item.amount_trx_id || index + 1,
        ...item,
        transaction_date: item.transaction_date
          ? new Date(item.transaction_date).toLocaleString("id-ID")
          : "",
      }));

      setAllTransactions(dataWithId);
      setTransactions(dataWithId.slice(0, 5));
    } catch (err) {
      console.log("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSeeAll = () => {
    if (showAll) {
      setTransactions(allTransactions.slice(0, 5));
    } else {
      setTransactions(allTransactions);
    }
    setShowAll(!showAll);
  };

  const renderItem = ({ item }) => {
    let color = "#22c55e";
    if (item.status === "PENDING") color = "#facc15";
    else if (item.status === "EXPIRED") color = "#ef4444";

    return (
      <View style={styles.row}>
        <View style={styles.leftSection}>
          <Ionicons name="checkmark-circle" size={24} color={color} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.txId}>{item.amount_trx_id}</Text>
            <Text style={styles.amount}>Rp {item.amount?.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={[styles.status, { color }]}>{item.status}</Text>
          <Text style={styles.date}>{item.transaction_date}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>{error}</Text>
      ) : (
        <>
         
          <View style={styles.header}>
            <Text style={styles.headerText}>Last Transaction</Text>
            {allTransactions.length > 5 && (
              <TouchableOpacity onPress={handleSeeAll}>
                <Text style={styles.seeAllText}>{showAll ? "Hide" : "See All"}</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#16a34a", padding: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 100,
    paddingHorizontal: 10,
  },
  headerText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  listContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  leftSection: { flexDirection: "row", alignItems: "center" },
  rightSection: { alignItems: "flex-end" },
  txId: { fontSize: 14, color: "#111827", fontWeight: "500" },
  amount: { fontSize: 13, color: "#374151" },
  status: { fontSize: 13, fontWeight: "600" },
  date: { fontSize: 12, color: "#6b7280" },
  seeAllText: {
    color: "#f0fdf4",
    fontWeight: "bold",
    fontSize: 16,
  },
});
