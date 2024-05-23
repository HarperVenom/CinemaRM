import { useEffect, useState } from "react";
import axios from "axios";

export default function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function getData() {
    try {
      setLoading(true);
      const response = await axios.get(url);
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function postData(postUrl, postData) {
    try {
      setLoading(true);
      const response = await axios.post(postUrl, postData);
      return response;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateData(updateUrl, updateData) {
    try {
      setLoading(true);
      const response = await axios.update(updateUrl, updateData);
      return response;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, [url]);

  return { data, loading, error, postData, updateData };
}
