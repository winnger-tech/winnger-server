const axios = require('axios');
class CertnApi {
  constructor() {
    this.baseUrl = process.env.CERTN_API_URL || 'https://api.certn.co/v1';
    this.apiKey = process.env.CERTN_API_KEY;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }
  async createApplicant(data) {
    try {
      const response = await this.client.post('/applicants', data);
      return response.data;
    } catch (error) {
      console.error('Error creating Certn applicant:', error.response?.data || error.message);
      throw error;
    }
  }
  async requestBackgroundCheck(applicantId) {
    try {
      const response = await this.client.post(`/applicants/${applicantId}/checks`, {
        type: 'criminal',
        country: 'CA'
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting background check:', error.response?.data || error.message);
      throw error;
    }
  }
  async requestDrivingAbstract(applicantId) {
    try {
      const response = await this.client.post(`/applicants/${applicantId}/driving-abstract`, {
        country: 'CA'
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting driving abstract:', error.response?.data || error.message);
      throw error;
    }
  }
  async getCheckStatus(checkId) {
    try {
      const response = await this.client.get(`/checks/${checkId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting check status:', error.response?.data || error.message);
      throw error;
    }
  }
  async getDrivingAbstractStatus(abstractId) {
    try {
      const response = await this.client.get(`/driving-abstracts/${abstractId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting driving abstract status:', error.response?.data || error.message);
      throw error;
    }
  }
}
const certnApi = new CertnApi();
module.exports = {
  certnApi
};