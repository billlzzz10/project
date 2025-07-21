import React, { useState, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  Chip,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';

// Mock API functions
const mockGenerateGraphFromWork = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: data.title,
        description: data.description,
        nodes: [
          { id: 1, title: 'รายงานการขาย Q2 2025', type: 'work_item', content: 'รายงานผลการขายประจำไตรมาส 2 ปี 2025', position_x: 0, position_y: 0 },
          { id: 2, title: 'แผนการตลาด', type: 'work_item', content: 'แผนการตลาดและกลยุทธ์', position_x: 200, position_y: 100 },
          { id: 3, title: 'วิเคราะห์คู่แข่ง', type: 'work_item', content: 'การวิเคราะห์คู่แข่งในตลาด', position_x: -200, position_y: 100 },
          { id: 4, title: 'แผนการเงิน', type: 'work_item', content: 'แผนการเงินและงบประมาณ', position_x: 100, position_y: -150 },
          { id: 5, title: 'รายงานทรัพยากรบุคคล', type: 'work_item', content: 'รายงานทรัพยากรบุคคลและการพัฒนาบุคลากร', position_x: -100, position_y: -150 }
        ],
        edges: [
          { id: 1, source: 1, target: 2, type: 'tag_relation', label: 'การตลาด' },
          { id: 2, source: 1, target: 3, type: 'tag_relation', label: 'การวิเคราะห์' },
          { id: 3, source: 1, target: 4, type: 'tag_relation', label: 'การเงิน' },
          { id: 4, source: 2, target: 3, type: 'tag_relation', label: 'การตลาด' },
          { id: 5, source: 4, target: 5, type: 'tag_relation', label: 'รายงาน' }
        ]
      });
    }, 1500);
  });
};

const mockGetGraph = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        nodes: [
          { id: 1, title: 'รายงานการขาย Q2 2025', type: 'work_item', content: 'รายงานผลการขายประจำไตรมาส 2 ปี 2025', position_x: 0, position_y: 0 },
          { id: 2, title: 'แผนการตลาด', type: 'work_item', content: 'แผนการตลาดและกลยุทธ์', position_x: 200, position_y: 100 },
          { id: 3, title: 'วิเคราะห์คู่แข่ง', type: 'work_item', content: 'การวิเคราะห์คู่แข่งในตลาด', position_x: -200, position_y: 100 },
          { id: 4, title: 'แผนการเงิน', type: 'work_item', content: 'แผนการเงินและงบประมาณ', position_x: 100, position_y: -150 },
          { id: 5, title: 'รายงานทรัพยากรบุคคล', type: 'work_item', content: 'รายงานทรัพยากรบุคคลและการพัฒนาบุคลากร', position_x: -100, position_y: -150 }
        ],
        edges: [
          { id: 1, source: 1, target: 2, type: 'tag_relation', label: 'การตลาด' },
          { id: 2, source: 1, target: 3, type: 'tag_relation', label: 'การวิเคราะห์' },
          { id: 3, source: 1, target: 4, type: 'tag_relation', label: 'การเงิน' },
          { id: 4, source: 2, target: 3, type: 'tag_relation', label: 'การตลาด' },
          { id: 5, source: 4, target: 5, type: 'tag_relation', label: 'รายงาน' }
        ]
      });
    }, 1000);
  });
};

function GraphView() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [generateDialog, setGenerateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'list'
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeInfoDialog, setNodeInfoDialog] = useState(false);
  const [graphLayout, setGraphLayout] = useState('force'); // 'force', 'radial', 'dagre'

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const response = await mockGetGraph();
      
      // Convert to format expected by ForceGraph2D
      const graphData = {
        nodes: response.nodes.map(node => ({
          id: node.id,
          name: node.title,
          content: node.content,
          type: node.type,
          x: node.position_x,
          y: node.position_y,
          val: 1 // Size of node
        })),
        links: response.edges.map(edge => ({
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: edge.type
        }))
      };
      
      setGraphData(graphData);
    } catch (error) {
      console.error('Error loading graph:', error);
      showSnackbar('ไม่สามารถโหลดกราฟได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGraph = async () => {
    if (!formData.title) {
      showSnackbar('กรุณาระบุชื่อกราฟ', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const result = await mockGenerateGraphFromWork(formData);
      
      // Convert to format expected by ForceGraph2D
      const graphData = {
        nodes: result.nodes.map(node => ({
          id: node.id,
          name: node.title,
          content: node.content,
          type: node.type,
          x: node.position_x,
          y: node.position_y,
          val: 1 // Size of node
        })),
        links: result.edges.map(edge => ({
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: edge.type
        }))
      };
      
      setGraphData(graphData);
      setGenerateDialog(false);
      showSnackbar('สร้างกราฟจากงานสำเร็จ', 'success');
    } catch (error) {
      console.error('Error generating graph:', error);
      showSnackbar('ไม่สามารถสร้างกราฟจากงานได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback(node => {
    setSelectedNode(node);
    setNodeInfoDialog(true);
  }, []);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleLayoutChange = (event, newLayout) => {
    if (newLayout !== null) {
      setGraphLayout(newLayout);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          กราฟวิว (Obsidian-like)
        </Typography>
        <Box>
          <ToggleButtonGroup
            value={graphLayout}
            exclusive
            onChange={handleLayoutChange}
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="force" aria-label="force layout">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="radial" aria-label="radial layout">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadGraph}
            sx={{ mr: 1 }}
          >
            รีเฟรช
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setFormData({
                title: '',
                description: ''
              });
              setGenerateDialog(true);
            }}
          >
            สร้างกราฟจากงาน
          </Button>
        </Box>
      </Box>

      {/* Graph View */}
      <Box sx={{ height: 'calc(100vh - 180px)', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : graphData.nodes.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ไม่พบข้อมูลกราฟ
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setFormData({
                  title: '',
                  description: ''
                });
                setGenerateDialog(true);
              }}
              sx={{ mt: 2 }}
            >
              สร้างกราฟจากงาน
            </Button>
          </Box>
        ) : (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel={node => `${node.name}`}
            nodeColor={node => node.type === 'work_item' ? '#1976d2' : '#4caf50'}
            linkLabel={link => link.label}
            linkColor={() => '#888'}
            linkWidth={2}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.8); // padding
              
              // Node background
              ctx.fillStyle = node.type === 'work_item' ? '#1976d2' : '#4caf50';
              ctx.beginPath();
              if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1], 5);
              } else {
                // Fallback for browsers without roundRect
                const x = node.x - bckgDimensions[0] / 2;
                const y = node.y - bckgDimensions[1] / 2;
                const w = bckgDimensions[0];
                const h = bckgDimensions[1];
                const r = 5;
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                ctx.lineTo(x + w, y + h - r);
                ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                ctx.lineTo(x + r, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
              }
              ctx.fill();
              
              // Node text
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'white';
              ctx.fillText(label, node.x, node.y);
              
              // Save node dimensions for hit detection
              node.__bckgDimensions = bckgDimensions;
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
              if (node.__bckgDimensions) {
                ctx.fillStyle = color;
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                  ctx.roundRect(
                    node.x - node.__bckgDimensions[0] / 2,
                    node.y - node.__bckgDimensions[1] / 2,
                    node.__bckgDimensions[0],
                    node.__bckgDimensions[1],
                    5
                  );
                } else {
                  // Fallback for browsers without roundRect
                  const x = node.x - node.__bckgDimensions[0] / 2;
                  const y = node.y - node.__bckgDimensions[1] / 2;
                  const w = node.__bckgDimensions[0];
                  const h = node.__bckgDimensions[1];
                  const r = 5;
                  ctx.moveTo(x + r, y);
                  ctx.lineTo(x + w - r, y);
                  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                  ctx.lineTo(x + w, y + h - r);
                  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                  ctx.lineTo(x + r, y + h);
                  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                  ctx.lineTo(x, y + r);
                  ctx.quadraticCurveTo(x, y, x + r, y);
                }
                ctx.fill();
              }
            }}
          />
        )}
      </Box>

      {/* Generate Dialog */}
      <Dialog
        open={generateDialog}
        onClose={() => setGenerateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>สร้างกราฟจากงาน</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่อกราฟ"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="คำอธิบาย (ไม่บังคับ)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleGenerateGraph}
            variant="contained"
            disabled={loading || !formData.title}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            สร้าง
          </Button>
        </DialogActions>
      </Dialog>

      {/* Node Info Dialog */}
      <Dialog
        open={nodeInfoDialog}
        onClose={() => setNodeInfoDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>รายละเอียดโหนด</DialogTitle>
        <DialogContent>
          {selectedNode && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedNode.name}
                </Typography>
                <Chip
                  label={selectedNode.type === 'work_item' ? 'งาน' : 'โหนด'}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  {selectedNode.content}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  การเชื่อมโยง
                </Typography>
                <Box>
                  {graphData.links
                    .filter(link => link.source.id === selectedNode.id || link.target.id === selectedNode.id)
                    .map((link, index) => {
                      const isSource = link.source.id === selectedNode.id;
                      const connectedNode = isSource ? link.target : link.source;
                      return (
                        <Chip
                          key={index}
                          label={`${isSource ? 'ไปยัง' : 'จาก'} ${connectedNode.name} (${link.label})`}
                          size="small"
                          sx={{ m: 0.5 }}
                        />
                      );
                    })}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodeInfoDialog(false)}>ปิด</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GraphView;

