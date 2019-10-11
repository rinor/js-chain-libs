import graphql from 'babel-plugin-relay/macro';

const transactionQuery = graphql`
  query transactionSearchResultQuery($id: String!) {
    transaction(id: $id) {
      ...FullTransactionInfo_transaction
    }
  }
`;

export default transactionQuery;
