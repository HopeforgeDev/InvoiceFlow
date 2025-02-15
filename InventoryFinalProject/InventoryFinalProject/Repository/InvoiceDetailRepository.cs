using InventoryFinalProject.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;

namespace InventoryFinalProject.Repository
{
    public class InvoiceDetailRepository
    {
        private readonly string _connectionString;
        public InvoiceDetailRepository()
        {
            _connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        }

        public int InsertInvoiceDetail(InvoiceDetail invoiceDetail)
        {
            string procedure = "spwv_tr_insertinvoicedetail";
            int newDetailSeq = 0;

            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                connection.Open();
                SqlTransaction transaction = connection.BeginTransaction();

                using (SqlCommand command = new SqlCommand(procedure, connection, transaction))
                {
                    try
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@fk_ih_seq", invoiceDetail.FkIhSeq);
                        command.Parameters.AddWithValue("@id_itemname", invoiceDetail.IdItemName);
                        command.Parameters.AddWithValue("@id_qty", invoiceDetail.IdQty);
                        command.Parameters.AddWithValue("@id_price", invoiceDetail.IdPrice);

                        SqlParameter outputIdSeq = new SqlParameter("@id_seq", SqlDbType.Int)
                        {
                            Direction = ParameterDirection.Output
                        };
                        command.Parameters.Add(outputIdSeq);

                        command.ExecuteNonQuery();

                        newDetailSeq = (int)outputIdSeq.Value;
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                        try
                        {
                            transaction.Rollback();
                        }
                        catch (Exception rollbackEx)
                        {
                            Console.WriteLine(rollbackEx.Message);
                        }
                        return -1;
                    }
                }
            }

            return newDetailSeq;
        }
        public bool UpdateInvoiceDetail(int idSeq, string itemName, int qty, decimal price, out decimal updatedTotal)
        {
            string procedure = "spwv_tr_updateinvoicedetail";
            bool result = true; 
            updatedTotal = 0m; 

            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    connection.Open();

                    using (SqlCommand command = new SqlCommand(procedure, connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@id_seq", idSeq);
                        command.Parameters.AddWithValue("@id_itemname", itemName);
                        command.Parameters.AddWithValue("@id_qty", qty);
                        command.Parameters.AddWithValue("@id_price", price);

                        SqlParameter outputParam = new SqlParameter
                        {
                            ParameterName = "@updated_total",
                            SqlDbType = SqlDbType.Decimal,
                            Direction = ParameterDirection.Output,
                            Precision = 18,
                            Scale = 2
                        };
                        command.Parameters.Add(outputParam);

                        int rowsAffected = command.ExecuteNonQuery();

                        // Check if rows were affected
                        if (rowsAffected <= 0)
                        {
                            result = false;
                        }

                        // Get the output parameter value
                        updatedTotal = (decimal)command.Parameters["@updated_total"].Value;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                result = false; // Set result to false if an exception occurs
            }

            return result;
        }
        public bool DeleteInvoiceDetail(int IdSeq, out decimal Total)
        {
            string procedure = "spwv_tr_deleteinvoicedetail";
            Total = 0;

            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    connection.Open();
                    SqlTransaction transaction = connection.BeginTransaction();

                    using (SqlCommand command = new SqlCommand(procedure, connection, transaction))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@id_seq",IdSeq);

                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                Total = (decimal)reader["UpdatedTotal"];
                            }
                        }

                        transaction.Commit();
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }
        public List<InvoiceDetail> GetInvoiceDetailsByHeaderSeq(int ihSeq)
        {
            string procedure = "spwv_tr_selectallinvoicedetailbyihseq";
            List<InvoiceDetail> invoiceDetails = new List<InvoiceDetail>();

            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    connection.Open();

                    using (SqlCommand command = new SqlCommand(procedure, connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@ih_seq", ihSeq);

                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                InvoiceDetail detail = new InvoiceDetail
                                {
                                    IdSeq = Convert.ToInt32(reader["id_seq"]),
                                    FkIhSeq = Convert.ToInt32(reader["fk_ih_seq"]),
                                    IdItemName = reader["id_itemname"].ToString(),
                                    IdQty = Convert.ToInt32(reader["id_qty"]),
                                    IdPrice = Convert.ToDecimal(reader["id_price"]),
                                };
                                invoiceDetails.Add(detail);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return invoiceDetails;
        }
        public InvoiceDetail GetDetailsBySeq(int idSeq)
        {
            string procedure = "spwv_tr_selectalldetailbyidseq";
            InvoiceDetail invoiceDetails = null;
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    connection.Open();

                    using (SqlCommand command = new SqlCommand(procedure, connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@id_seq", idSeq);

                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                invoiceDetails = new InvoiceDetail
                                {
                                    IdSeq = Convert.ToInt32(reader["id_seq"]),
                                    FkIhSeq = Convert.ToInt32(reader["fk_ih_seq"]),
                                    IdItemName = reader["id_itemname"].ToString(),
                                    IdQty = Convert.ToInt32(reader["id_qty"]),
                                    IdPrice = Convert.ToDecimal(reader["id_price"]),
                                };
                                
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return invoiceDetails;
        }

    }
}
