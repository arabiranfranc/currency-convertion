"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface Conversion {
  currency: string;
  value: string;
}

export default function Home() {
  const [base, setBase] = useState<string>("USD");
  const [amount, setAmount] = useState<string>("");
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const [conversionList, setConversionList] = useState<Conversion[]>([
    { currency: "ADA", value: "" },
  ]);

  const getConversions = async () => {
    try {
      const response = await axios.get(`https://api.fxratesapi.com/latest`);
      setConversions(response.data.rates);
    } catch (error) {
      console.error("Error fetching conversions:", error);
    }
  };

  const getConversion = async (amount: string) => {
    if (amount === "") return;

    try {
      // Fetch conversion rates for all items in conversionList
      const results = await Promise.all(
        conversionList.map(async (item) => {
          const response = await axios.get(
            `https://api.fxratesapi.com/latest?currencies=${item.currency}&base=${base}&amount=${amount}`
          );
          return {
            currency: item.currency,
            value: response.data.rates?.[item.currency] || "N/A",
          };
        })
      );

      // Update the state with new values
      setConversionList((prevList) =>
        prevList.map((item) => {
          const updatedItem = results.find(
            (res) => res.currency === item.currency
          );
          return updatedItem ? { ...item, value: updatedItem.value } : item;
        })
      );
    } catch (error) {
      console.error("Error fetching conversion:", error);
    }
  };

  const switchConversion = () => {
    setBase(conversionList[0].currency);
    setConversionList([{ currency: base, value: "" }]);
  };

  const addConversionField = () => {
    setConversionList([...conversionList, { currency: "ADA", value: "" }]);
  };

  useEffect(() => {
    getConversions();
  }, []);

  useEffect(() => {
    getConversion(amount);
  }, [amount]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center gap-4 w-full max-w-lg p-4 bg-white shadow-lg rounded-lg">
        <h2>Currency Converter</h2>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded-md"
        />

        <select
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          {Object.keys(conversions).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <button
          onClick={switchConversion}
          className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          style={{ display: conversionList.length === 1 ? "block" : "none" }}
        >
          Switch
        </button>

        {conversionList.map((item, index) => (
          <div key={index} className="flex gap-2 w-full">
            <select
              value={item.currency}
              onChange={(e) => {
                setConversionList((prevList) =>
                  prevList.map((conv, i) =>
                    i === index ? { ...conv, currency: e.target.value } : conv
                  )
                );
              }}
              className="flex-1 p-2 border rounded-md"
            >
              {Object.keys(conversions).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Converted Value"
              value={item.value}
              disabled
              className="flex-1 p-2 border rounded-md"
            />
          </div>
        ))}

        <button
          onClick={addConversionField}
          className="w-full p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          + Add Another Currency
        </button>
      </div>
    </div>
  );
}
