using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using System.Linq;
using System.Web;
using System.Configuration;
using InventoryFinalProject.Models;

namespace InventoryFinalProject.Repository
{

    public class InvoiceHeaderRepository
    {
        private readonly string _connectionString;

        public InvoiceHeaderRepository()
        {
            _connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        }

        public int InsertInvoiceHeader(string clientName, decimal total)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                using (SqlTransaction transaction = connection.BeginTransaction())
                {
                    try
                    {
                        using (SqlCommand command = new SqlCommand("spwv_tr_insertinvoiceheader", connection, transaction))
                        {
                            command.CommandType = CommandType.StoredProcedure;

                            command.Parameters.AddWithValue("@ih_clientname", clientName);
                            command.Parameters.AddWithValue("@ih_total", total);

                            object result = command.ExecuteScalar();

                            if (result != null && int.TryParse(result.ToString(), out int ihSeq))
                            {
                                transaction.Commit();
                                return ihSeq;
                            }
                            else
                            {
                                transaction.Rollback();
                                throw new Exception("No valid data returned from stored procedure.");
                            }
                        }
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }
        public int UpdateClientName(int ihseq, string newClientName)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                using (SqlCommand command = new SqlCommand("spwv_tr_updateclientname", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@ih_seq", ihseq);
                    command.Parameters.AddWithValue("@new_clientname", newClientName);

                    SqlParameter updatedIdParam = new SqlParameter("@updated_id", SqlDbType.Int);
                    updatedIdParam.Direction = ParameterDirection.Output;
                    command.Parameters.Add(updatedIdParam);

                    command.ExecuteNonQuery();

                    int updatedId = (int)updatedIdParam.Value;
                    return updatedId;
                }
            }
        }
        public bool DeleteInvoice(int ihSeq)
        {
            string procedure = "spwv_tr_deleteinvoice";

            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    connection.Open();

                    using (SqlCommand command = new SqlCommand(procedure, connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@ih_seq", ihSeq);

                        var result = command.ExecuteScalar();

                        if (result != null && Convert.ToInt32(result) == 1)
                        {
                            return true;
                        }
                        else
                        {
                            return false;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                throw;
            }
        }
        public IEnumerable<InvoiceHeader> GetAllInvoiceHeaders()
        {
            List<InvoiceHeader> invoiceHeaders = new List<InvoiceHeader>();
            string procedure = "spwv_tr_selectallinvoiceheader";

            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                using (SqlCommand command = new SqlCommand(procedure, connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    connection.Open();

                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var invoiceHeader = new InvoiceHeader
                            {
                                IhSeq = (int)reader["ih_seq"],
                                IhNumber = (int)reader["ih_number"],
                                IhClientName = reader["ih_clientname"].ToString(),
                                IhTotal = reader["ih_total"] == DBNull.Value ? 0 : (decimal)reader["ih_total"],
                                IhAddDate = (DateTime)reader["ih_adddate"]
                            };
                            invoiceHeaders.Add(invoiceHeader);
                        }
                    }
                }
            }

            return invoiceHeaders;
        }

    }
}