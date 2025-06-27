let matchedGlobal = [], onlyInternalGlobal = [], onlyProviderGlobal = [];

document.getElementById('compareBtn').addEventListener('click', async () => {
  const internalFile = document.getElementById('internalFile').files[0];
  const providerFile = document.getElementById('providerFile').files[0];

  if (!internalFile || !providerFile) {
    alert('Please upload both files');
    return;
  }

  const internalData = await readCSV(internalFile);
  const providerData = await readCSV(providerFile);

  reconcile(internalData, providerData);
});

function readCSV(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const lines = reader.result.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map((line) => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((h, i) => {
          obj[h.trim()] = values[i].trim();
        });
        return obj;
      });
      resolve(data);
    };
    reader.readAsText(file);
  });
}

function reconcile(internal, provider) {
  const matched = [];
  const onlyInternal = [];
  const onlyProvider = [];

  const providerMap = new Map();
  provider.forEach((tx) => providerMap.set(tx.transaction_reference, tx));

  internal.forEach((tx) => {
    const ref = tx.transaction_reference;
    const match = providerMap.get(ref);
    if (match) {
      if (tx.amount === match.amount && tx.status === match.status) {
        matched.push(tx);
      } else {
        // same reference but mismatch in amount or status
        matched.push({ ...tx, mismatch: true, provider: match });
      }
      providerMap.delete(ref); // remove matched
    } else {
      onlyInternal.push(tx);
    }
  });

  // what's left in providerMap is unmatched
  onlyProvider.push(...providerMap.values());

  matchedGlobal = matched;
  onlyInternalGlobal = onlyInternal;
  onlyProviderGlobal = onlyProvider;

  displayResults(matched, onlyInternal, onlyProvider);
}

function displayResults(matched, onlyInternal, onlyProvider) {
  const matchedDiv = document.getElementById('matched');
  const internalDiv = document.getElementById('onlyInternal');
  const providerDiv = document.getElementById('onlyProvider');

  matchedDiv.innerHTML = matched.map(tx => `
    <div style="background:${tx.mismatch ? '#ffe0e0' : '#e0ffe0'}; padding:5px; margin:4px 0;">
      <strong>Ref:</strong> ${tx.transaction_reference} |
      <strong>Amount:</strong> ${tx.amount} |
      <strong>Status:</strong> ${tx.status}
      ${tx.mismatch ? `
        <br>
        <small style="color: red;">
          <strong>Mismatch Details:</strong><br>
          Expected → <strong>Amount:</strong> ${tx.amount}, <strong>Status:</strong> ${tx.status}<br>
          Provider → <strong>Amount:</strong> ${tx.provider.amount}, <strong>Status:</strong> ${tx.provider.status}
        </small>
      ` : ''}
    </div>
  `).join('');

  internalDiv.innerHTML = onlyInternal.map(tx => `
    <div style="background:#fffbe0; padding:5px; margin:4px 0;">
      <strong>Ref:</strong> ${tx.transaction_reference} |
      <strong>Amount:</strong> ${tx.amount} |
      <strong>Status:</strong> ${tx.status}
    </div>
  `).join('');

  providerDiv.innerHTML = onlyProvider.map(tx => `
    <div style="background:#ffe0f0; padding:5px; margin:4px 0;">
      <strong>Ref:</strong> ${tx.transaction_reference} |
      <strong>Amount:</strong> ${tx.amount} |
      <strong>Status:</strong> ${tx.status}
    </div>
  `).join('');
}

function exportCSV(category) {
  let data;
  if (category === 'matched') {
    data = matchedGlobal;
  } else if (category === 'onlyInternal') {
    data = onlyInternalGlobal;
  } else if (category === 'onlyProvider') {
    data = onlyProviderGlobal;
  }

  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]).filter(key => key !== 'provider' && key !== 'mismatch');
  const rows = data.map(obj => headers.map(h => obj[h]).join(','));
  const csvContent = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${category}_transactions.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
