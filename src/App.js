import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ikawdjqhxngagpcjcynv.supabase.co',
  'sb_publishable_abo2oEuHXEknhygQSjCk0g_huxT5Pqu'
);

export default function App() {
  const [leads, setLeads] = useState([]);
  const [company, setCompany] = useState('');
  const [project, setProject] = useState('');
  const [value, setValue] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [status, setStatus] = useState('新規');
  const [margin, setMargin] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchLeads = async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('id', { ascending: false });

    setLeads(data || []);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const addLead = async () => {
    if (!company.trim()) return;

    const payload = {
      company,
      project,
      value: Number(value) || 0,
      visitDate,
      nextAction,
      margin: Number(margin) || 0,
      status,
    };

    if (editingId) {
      await supabase.from('leads').update(payload).eq('id', editingId);
    } else {
      await supabase.from('leads').insert([payload]);
    }

    setCompany('');
    setProject('');
    setValue('');
    setVisitDate('');
    setNextAction('');
    setMargin('');
    setStatus('新規');
    setEditingId(null);

    fetchLeads();
  };

  const deleteLead = async (id) => {
    if (!window.confirm('削除する？')) return;
    await supabase.from('leads').delete().eq('id', id);
    fetchLeads();
  };

  const startEdit = (lead) => {
    setEditingId(lead.id);
    setCompany(lead.company || '');
    setProject(lead.project || '');
    setValue(lead.value || '');
    setVisitDate(lead.visitDate || '');
    setNextAction(lead.nextAction || '');
    setMargin(lead.margin || '');
    setStatus(lead.status || '新規');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filtered = leads.filter(
    (l) =>
      (l.company || '').includes(search) || (l.project || '').includes(search)
  );

  const totalValue = filtered.reduce((s, l) => s + (l.value || 0), 0);
  const totalOrder = filtered
    .filter((l) => l.status === '受注')
    .reduce((s, l) => s + (l.value || 0), 0);
  const totalProfit = filtered.reduce(
    (s, l) => s + ((l.value || 0) * (l.margin || 0)) / 100,
    0
  );

  const badgeStyle = (status) => ({
    background:
      status === '受注'
        ? 'green'
        : status === '商談中'
        ? 'orange'
        : status === '見積中'
        ? 'blue'
        : status === '融資審査中'
        ? 'purple'
        : status === '失注'
        ? 'red'
        : 'gray',
    color: 'white',
    padding: '2px 8px',
    borderRadius: 999,
    marginRight: 8,
  });

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <h1>営業管理</h1>

      <input
        placeholder="検索（会社名・案件）"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <div style={{ marginBottom: 16 }}>
        <b>金額合計: ¥{totalValue.toLocaleString()}</b>
        <br />
        <b style={{ color: 'green' }}>
          受注合計: ¥{totalOrder.toLocaleString()}
        </b>
        <br />
        <b style={{ color: 'blue' }}>
          利益合計: ¥{totalProfit.toLocaleString()}
        </b>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <input
          placeholder="会社名"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          placeholder="案件名"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        />
        <input
          placeholder="金額"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <input
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
        />
        <input
          placeholder="次アクション"
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
        />
        <input
          placeholder="粗利率（%）"
          value={margin}
          onChange={(e) => setMargin(e.target.value)}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>新規</option>
          <option>見積中</option>
          <option>商談中</option>
          <option>融資審査中</option>
          <option>受注</option>
          <option>失注</option>
        </select>

        <button onClick={addLead}>{editingId ? '更新' : '追加'}</button>
      </div>

      <ul style={{ marginTop: 20 }}>
        {filtered.map((l) => {
          const profit = ((l.value || 0) * (l.margin || 0)) / 100;

          return (
            <li key={l.id} style={{ marginBottom: 12 }}>
              <span style={badgeStyle(l.status)}>{l.status}</span>
              <b>{l.company}</b> - {l.project}
              <br />¥{Number(l.value || 0).toLocaleString()} / 粗利{' '}
              {l.margin || 0}% / 利益 ¥{profit.toLocaleString()}
              <br />
              {l.visitDate || '-'} / {l.nextAction || '-'}
              <br />
              <button onClick={() => startEdit(l)}>編集</button>
              <button onClick={() => deleteLead(l.id)}>削除</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
